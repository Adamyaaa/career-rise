import * as Joi from "joi";

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid("development", "test", "production")
    .default("development"),
  API_PORT: Joi.number().default(3001),
  CORS_ORIGIN: Joi.string().required(),

  DATABASE_URL: Joi.string().uri().required(),
  REDIS_URL: Joi.string().uri({ scheme: ["redis"] }).required(),

  JWT_ACCESS_SECRET: Joi.string().min(16).required(),
  JWT_REFRESH_SECRET: Joi.string().min(16).required(),
  JWT_ACCESS_TTL: Joi.string().default("15m"),
  JWT_REFRESH_TTL: Joi.string().default("7d"),
});
