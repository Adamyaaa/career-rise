import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER, APP_GUARD } from "@nestjs/core";
import { envValidationSchema } from "./config/env.validation";
import { PrismaModule } from "./prisma/prisma.module";
import { RedisModule } from "./redis/redis.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { SharedFilesModule } from "./shared-files/shared-files.module";
import { CoursesModule } from "./courses/courses.module";
import { AdminModule } from "./admin/admin.module";
import { HealthController } from "./health/health.controller";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { RolesGuard } from "./common/guards/roles.guard";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Tried in order; only the repo-root .env is expected to actually exist (see
      // .env.example) — docker-compose and the API read the same file.
      envFilePath: [".env", "../../.env"],
      validationSchema: envValidationSchema,
    }),
    PrismaModule,
    RedisModule,
    AuthModule,
    UsersModule,
    SharedFilesModule,
    CoursesModule,
    AdminModule,
  ],
  controllers: [HealthController],
  providers: [
    // Order matters: JwtAuthGuard populates req.user before RolesGuard reads it.
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
