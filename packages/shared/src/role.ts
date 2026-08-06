// Mirrors the `Role` enum in apps/api/prisma/schema.prisma.
// Keep in sync manually — this package has no Prisma dependency on purpose,
// so apps/web can consume it without pulling in the Prisma client.
export const ROLES = ["STUDENT", "MENTOR", "SUPER_ADMIN"] as const;

export type Role = (typeof ROLES)[number];
