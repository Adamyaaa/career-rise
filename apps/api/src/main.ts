import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.setGlobalPrefix("api/v1");
  app.enableCors({
    origin: config.getOrThrow<string>("CORS_ORIGIN"),
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // API_PORT wins when explicitly set, because in local dev `concurrently` exports
  // PORT=3000 for the web app and both processes inherit it — PORT-first would make the
  // API try to bind the frontend's port. On Render, API_PORT is unset and the injected
  // PORT is used. Binding 0.0.0.0 so the host can reach it from outside a container.
  const port = config.get<number>("API_PORT") ?? Number(process.env.PORT) ?? 3001;
  await app.listen(port, "0.0.0.0");
  Logger.log(`Career Rise API listening on port ${port} at /api/v1`, "Bootstrap");
}

void bootstrap();
