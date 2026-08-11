import { Controller, Get } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import { Public } from "../common/decorators/public.decorator";
import { PrismaService } from "../prisma/prisma.service";

// Render pings a health check path and restarts the service if it doesn't answer 200.
// Public because the platform has no credentials; it exposes nothing but liveness.
// Exempt from rate limiting: the platform polls this constantly and a 429 would read
// as unhealthy and trigger a restart loop.
@SkipThrottle()
@Controller("health")
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  async check() {
    // A trivial query, so a container that booted but lost its database is reported
    // unhealthy rather than silently serving errors.
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: "ok", uptime: Math.round(process.uptime()) };
  }
}
