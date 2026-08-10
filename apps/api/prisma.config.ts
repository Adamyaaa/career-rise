import path from "node:path";
import { defineConfig } from "prisma/config";

// Prisma CLI only auto-loads a .env next to schema.prisma or in cwd; this repo's single
// source of truth is the root .env (shared with docker-compose and NestJS's ConfigModule).
// Optional on purpose: in a container or on Render there is no .env file — the platform
// injects real environment variables instead, and a hard failure here breaks the build.
try {
  process.loadEnvFile(path.resolve(__dirname, "../../.env"));
} catch {
  // No .env on disk; rely on whatever is already in process.env.
}

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
});
