import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Role } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
}

interface AccessTokenPayload {
  sub: string;
  role: Role;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>("JWT_ACCESS_SECRET"),
    });
  }

  // Stateless validation directly trusting the verified JWT claims to optimize API latency.
  async validate(payload: AccessTokenPayload): Promise<AuthenticatedUser> {
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
