import * as Joi from "joi";

// Anything shipped in .env.example. Booting production with one of these would mean
// anyone who has read the repo can forge tokens for any user, so it's a hard failure
// rather than a warning.
const PLACEHOLDER_SECRETS = ["dev-access-secret-change-me", "dev-refresh-secret-change-me", "change-me"];

// 32 chars is the floor for an HS256 signing key (the algorithm's own key size).
// In production the value must also be unlike anything committed to the repo.
// Messages keep {{#label}} so the failure names the offending variable.
const jwtSecret = Joi.string()
  .min(32)
  .required()
  .when("NODE_ENV", {
    is: "production",
    then: Joi.string()
      .invalid(...PLACEHOLDER_SECRETS)
      .pattern(/change[-_]?me/i, { invert: true })
      .messages({
        "any.invalid": "{{#label}} must not be the placeholder value from .env.example",
        "string.pattern.invert.base": "{{#label}} looks like a placeholder — generate a real secret",
      }),
  });

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid("development", "test", "production")
    .default("development"),
  // No default on purpose: main.ts falls back to the platform-injected PORT when this
  // is unset. A Joi default would always win and PORT would never be honoured.
  API_PORT: Joi.number().optional(),
  CORS_ORIGIN: Joi.string().required(),

  DATABASE_URL: Joi.string().uri().required(),
  REDIS_URL: Joi.string().uri({ scheme: ["redis"] }).required(),

  JWT_ACCESS_SECRET: jwtSecret,
  JWT_REFRESH_SECRET: jwtSecret,
  JWT_ACCESS_TTL: Joi.string().default("15m"),
  JWT_REFRESH_TTL: Joi.string().default("7d"),

  // Optional: without it the API still boots and logs OTP codes to the console
  // instead of emailing them, so local dev works with no mail account.
  BREVO_API_KEY: Joi.string().allow('').optional(),
  MAIL_FROM: Joi.string().allow('').optional(),
})
  // Checked across the whole object rather than per-field, so the message says what is
  // actually wrong instead of inheriting the placeholder wording. If these matched, an
  // access token would also verify as a refresh token — a stolen 15-minute token could
  // then be renewed forever.
  .custom((env, helpers) => {
    if (env.JWT_ACCESS_SECRET && env.JWT_ACCESS_SECRET === env.JWT_REFRESH_SECRET) {
      return helpers.message({
        custom: "JWT_REFRESH_SECRET must be different from JWT_ACCESS_SECRET",
      } as never);
    }
    return env;
  });
