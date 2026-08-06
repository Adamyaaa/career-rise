import { randomUUID } from "crypto";
import { ConflictException, Injectable, UnauthorizedException, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { Role, User } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { RedisService } from "../redis/redis.service";
import { parseDurationToSeconds } from "../common/utils/duration";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

const BCRYPT_ROUNDS = 10;
const REFRESH_KEY_PREFIX = "refresh:";

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
        data: { email: dto.email, passwordHash, role: Role.STUDENT },
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

  async sendOtp(email: string): Promise<{ success: boolean; otp?: string }> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const redisKey = `otp:${email}`;

    // Store in Redis with 5 minutes TTL
    await this.redis.set(redisKey, code, "EX", 300);

    this.logger.log(`[OTP] Sent verification code to ${email}: ${code}`);

    // In development mode, return the OTP for easier E2E testing/frontend integration
    const isDev = this.config.get<string>("NODE_ENV") !== "production";
    return {
      success: true,
      ...(isDev ? { otp: code } : {}),
    };
  }

  async verifyOtp(email: string, code: string) {
    const redisKey = `otp:${email}`;
    const storedCode = await this.redis.get(redisKey);

    if (!storedCode || storedCode !== code) {
      throw new UnauthorizedException({
        code: "UNAUTHORIZED",
        message: "Invalid or expired OTP",
      });
    }

    // Delete OTP after successful verification
    await this.redis.del(redisKey);

    let user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Auto-register user as STUDENT if they don't exist
      const dummyPassword = randomUUID();
      const passwordHash = await bcrypt.hash(dummyPassword, BCRYPT_ROUNDS);

      user = await this.prisma.$transaction(async (tx) => {
        const created = await tx.user.create({
          data: { email, passwordHash, role: Role.STUDENT },
        });
        await tx.studentProfile.create({ data: { userId: created.id } });
        return created;
      });
      this.logger.log(`[OTP] Auto-registered new student user for email ${email}`);
    }

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
    return { id: user.id, email: user.email, role: user.role, createdAt: user.createdAt };
  }
}
