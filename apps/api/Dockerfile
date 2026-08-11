FROM node:22-alpine AS build
WORKDIR /repo
# Build context is the REPO ROOT, not apps/api — the workspace layout and the shared
# package have to come along. Build with:
#   docker build -f apps/api/Dockerfile .
COPY package.json package-lock.json ./
# Both workspaces' tsconfigs extend this; without it tsc fails with TS5083.
COPY tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/
RUN npm ci
COPY packages/shared packages/shared
COPY apps/api apps/api
RUN npm run build --workspace=packages/shared
RUN npm run prisma:generate --workspace=apps/api
RUN npm run build --workspace=apps/api

FROM node:22-alpine AS runtime
WORKDIR /repo
ENV NODE_ENV=production
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/package.json ./package.json
COPY --from=build /repo/packages/shared ./packages/shared
COPY --from=build /repo/apps/api/dist ./apps/api/dist
COPY --from=build /repo/apps/api/prisma ./apps/api/prisma
COPY --from=build /repo/apps/api/package.json ./apps/api/package.json
EXPOSE 3001
# nest build emits to dist/src/, because prisma.config.ts at the package root widens
# tsc's inferred rootDir. Not dist/main.js.
CMD npx prisma migrate deploy --schema apps/api/prisma/schema.prisma && node apps/api/dist/src/main.js
