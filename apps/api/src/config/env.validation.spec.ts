import { envValidationSchema } from "./env.validation";

const BASE = {
  CORS_ORIGIN: "http://localhost:3000",
  DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
  REDIS_URL: "redis://localhost:6379",
};

// Distinct, long enough, and nothing like a placeholder.
const STRONG_A = "yB2xr8QwPmLk3vTn6ZsHdF9aCeJgUiOp";
const STRONG_B = "Qa7WsXeDcRfVtGbYhNuJmIkOlPzZ1x4C";

const validate = (overrides: Record<string, unknown>) =>
  envValidationSchema.validate({ ...BASE, ...overrides }, { allowUnknown: true });

describe("envValidationSchema — JWT secrets", () => {
  it("accepts two strong, distinct secrets in production", () => {
    const { error } = validate({
      NODE_ENV: "production",
      JWT_ACCESS_SECRET: STRONG_A,
      JWT_REFRESH_SECRET: STRONG_B,
    });
    expect(error).toBeUndefined();
  });

  it("rejects the placeholder committed in .env.example", () => {
    const { error } = validate({
      NODE_ENV: "production",
      JWT_ACCESS_SECRET: "dev-access-secret-change-me",
      JWT_REFRESH_SECRET: STRONG_B,
    });
    expect(error?.message).toContain("JWT_ACCESS_SECRET");
  });

  it("rejects anything still containing 'change-me' in production", () => {
    const { error } = validate({
      NODE_ENV: "production",
      JWT_ACCESS_SECRET: "please-change-me-before-deploying-abcdef",
      JWT_REFRESH_SECRET: STRONG_B,
    });
    expect(error).toBeDefined();
  });

  it("rejects secrets shorter than the 32-char HS256 key size", () => {
    const { error } = validate({
      NODE_ENV: "production",
      JWT_ACCESS_SECRET: "tooshort",
      JWT_REFRESH_SECRET: STRONG_B,
    });
    expect(error?.message).toMatch(/length must be at least 32/);
  });

  // If these matched, an access token would also verify as a refresh token — a stolen
  // 15-minute token would then be renewable forever.
  it("rejects a refresh secret identical to the access secret", () => {
    const { error } = validate({
      NODE_ENV: "production",
      JWT_ACCESS_SECRET: STRONG_A,
      JWT_REFRESH_SECRET: STRONG_A,
    });
    expect(error?.message).toContain("different from JWT_ACCESS_SECRET");
  });

  // The placeholder check is production-only so a fresh clone still boots locally,
  // but the length floor applies everywhere.
  it("still enforces minimum length outside production", () => {
    const { error } = validate({
      NODE_ENV: "development",
      JWT_ACCESS_SECRET: "short",
      JWT_REFRESH_SECRET: STRONG_B,
    });
    expect(error).toBeDefined();
  });
});
