import { randomInt, randomUUID } from "crypto";
import {
  ConflictException,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { Role, User } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { RedisService } from "../redis/redis.service";
import { MailService } from "../mail/mail.service";
import { parseDurationToSeconds } from "../common/utils/duration";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

const BCRYPT_ROUNDS = 10;
const REFRESH_KEY_PREFIX = "refresh:";
const OTP_TTL_SECONDS = 300;
// Caps each issued code at 5 guesses out of a million.
const OTP_MAX_ATTEMPTS = 5;

const otpAttemptsKey = (email: string) => `otp-attempts:${email}`;

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface RefreshTokenPayload {
  sub: string;
  jti: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly redis: RedisService,
    private readonly mail: MailService,
  ) {}

  // Always creates a STUDENT — MENTOR/SUPER_ADMIN accounts are provisioned via the
  // (future) POST /admin/users, not self-registration. See Phase 4 plan, Decision 4.
  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException({
        code: "CONFLICT",
        message: "Email is already registered",
      });
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const user = await this.prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email: dto.email,
          passwordHash,
          role: Role.STUDENT,
          firstName: dto.firstName.trim(),
          lastName: dto.lastName.trim(),
          phone: dto.phone?.trim() || null,
        },
      });
      await tx.studentProfile.create({ data: { userId: created.id } });
      return created;
    });

    const tokens = await this.issueTokenPair(user.id, user.role, user.email);
    return { user: this.toPublicUser(user), ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException({
        code: "UNAUTHORIZED",
        message: "Invalid email or password",
      });
    }
    this.assertActive(user.isActive);

    const tokens = await this.issueTokenPair(user.id, user.role, user.email);
    return { user: this.toPublicUser(user), ...tokens };
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    const payload = await this.verifyRefreshToken(refreshToken);
    const redisKey = `${REFRESH_KEY_PREFIX}${payload.jti}`;

    const storedUserId = await this.redis.get(redisKey);
    if (!storedUserId || storedUserId !== payload.sub) {
      throw new UnauthorizedException({
        code: "UNAUTHORIZED",
        message: "Refresh token is invalid or has already been used",
      });
    }
    // Rotate: the old jti is consumed on use, whether or not the rest of this call succeeds.
    await this.redis.del(redisKey);

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      throw new UnauthorizedException({ code: "UNAUTHORIZED", message: "User no longer exists" });
    }

    return this.issueTokenPair(user.id, user.role, user.email);
  }

  async sendOtp(email: string): Promise<{ success: boolean; delivered: boolean; otp?: string }> {
    // Only send to addresses that actually have an account. Without this the endpoint
    // is an open relay: anyone could make our mail account send to any address on the
    // internet and drain the daily quota.
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, isActive: true },
    });

    const isDev = this.config.get<string>("NODE_ENV") !== "production";

    // The response is identical whether or not the account exists, so this can't be
    // used to discover which email addresses are registered.
    if (!user || !user.isActive) {
      this.logger.warn(`OTP requested for unknown or inactive account ${email} — not sent`);
      return { success: true, delivered: this.mail.isConfigured };
    }

    const code = randomInt(100000, 1000000).toString();
    const redisKey = `otp:${email}`;

    await this.redis.set(redisKey, code, "EX", OTP_TTL_SECONDS);
    // A fresh code resets the failure count, so earlier wrong guesses can't lock out
    // the legitimate owner once they request a new one.
    await this.redis.del(otpAttemptsKey(email));

    try {
      await this.mail.sendOtpCode(email, code);
    } catch {
      await this.redis.del(redisKey);
      throw new ServiceUnavailableException({
        code: "MAIL_FAILED",
        message: "Couldn't send the verification email. Please try again.",
      });
    }

    // The code is only ever returned when there's no mail provider configured — i.e. a
    // local dev machine with no BREVO_API_KEY. Returning it once mail works would let
    // anyone request a code for someone else's address and read it straight back.
    return {
      success: true,
      delivered: this.mail.isConfigured,
      ...(!this.mail.isConfigured && isDev ? { otp: code } : {}),
    };
  }

  async verifyOtp(email: string, code: string) {
    const redisKey = `otp:${email}`;
    const storedCode = await this.redis.get(redisKey);

    if (!storedCode || storedCode !== code) {
      // Per-code failure counter, in Redis so it holds across API instances. IP
      // throttling alone can't stop a distributed guess at a 6-digit code; burning the
      // code after a handful of misses caps each code at OTP_MAX_ATTEMPTS tries out of
      // a million, instead of unlimited.
      if (storedCode) {
        const attempts = await this.redis.incr(otpAttemptsKey(email));
        if (attempts === 1) {
          await this.redis.expire(otpAttemptsKey(email), OTP_TTL_SECONDS);
        }
        if (attempts >= OTP_MAX_ATTEMPTS) {
          await this.redis.del(redisKey, otpAttemptsKey(email));
          this.logger.warn(`OTP for ${email} invalidated after ${attempts} failed attempts`);
        }
      }

      throw new UnauthorizedException({
        code: "UNAUTHORIZED",
        message: "Invalid or expired OTP",
      });
    }

    // Consume the code and its counter on success — each code is single use.
    await this.redis.del(redisKey, otpAttemptsKey(email));

    // OTP signs in existing accounts only. It used to silently create a STUDENT for any
    // unknown address, which meant anyone could mint an account — and it would bypass
    // the name/phone the register form collects. Mentors and admins are provisioned by
    // an admin, students sign up themselves.
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException({
        code: "UNAUTHORIZED",
        message: "No account found for that email — sign up first",
      });
    }
    this.assertActive(user.isActive);

    const tokens = await this.issueTokenPair(user.id, user.role, user.email);
    return { user: this.toPublicUser(user), ...tokens };
  }

  async logout(refreshToken: string): Promise<void> {
    const payload = await this.verifyRefreshToken(refreshToken).catch(() => null);
    if (!payload) {
      return;
    }
    await this.redis.del(`${REFRESH_KEY_PREFIX}${payload.jti}`);
  }

  // Deliberately the same wording for both login paths, so it never hints at whether an
  // address exists — only that this one can't sign in.
  private assertActive(isActive: boolean) {
    if (!isActive) {
      throw new UnauthorizedException({
        code: "UNAUTHORIZED",
        message: "This account has been deactivated. Contact your administrator.",
      });
    }
  }

  private async issueTokenPair(userId: string, role: Role, email: string): Promise<TokenPair> {
    // Passed as seconds (not the raw "15m"/"7d" strings) so TS can type-check expiresIn
    // as a plain number rather than needing the `ms` package's branded string literal type.
    const accessTtlSeconds = parseDurationToSeconds(
      this.config.getOrThrow<string>("JWT_ACCESS_TTL"),
    );
    const refreshTtlSeconds = parseDurationToSeconds(
      this.config.getOrThrow<string>("JWT_REFRESH_TTL"),
    );

    const accessToken = await this.jwt.signAsync(
      { sub: userId, role, email },
      {
        secret: this.config.getOrThrow<string>("JWT_ACCESS_SECRET"),
        expiresIn: accessTtlSeconds,
      },
    );

    const jti = randomUUID();
    const refreshToken = await this.jwt.signAsync(
      { sub: userId, jti },
      {
        secret: this.config.getOrThrow<string>("JWT_REFRESH_SECRET"),
        expiresIn: refreshTtlSeconds,
      },
    );

    await this.redis.set(`${REFRESH_KEY_PREFIX}${jti}`, userId, "EX", refreshTtlSeconds);

    return { accessToken, refreshToken };
  }

  private async verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
    try {
      return await this.jwt.verifyAsync<RefreshTokenPayload>(token, {
        secret: this.config.getOrThrow<string>("JWT_REFRESH_SECRET"),
      });
    } catch {
      throw new UnauthorizedException({
        code: "UNAUTHORIZED",
        message: "Invalid or expired refresh token",
      });
    }
  }

  private toPublicUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      createdAt: user.createdAt,
    };
  }
}
