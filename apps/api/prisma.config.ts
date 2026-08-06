import path from "node:path";
import { defineConfig } from "prisma/config";

// Prisma CLI only auto-loads a .env next to schema.prisma or in cwd; this repo's single
// source of truth is the root .env (shared with docker-compose and NestJS's ConfigModule).
process.loadEnvFile(path.resolve(__dirname, "../../.env"));

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
});
