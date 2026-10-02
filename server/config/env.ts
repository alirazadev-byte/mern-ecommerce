import { databaseEnv } from "./databaseEnv";

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optional(name: string, fallback: string): string {
  return process.env[name]?.trim() || fallback;
}

function positiveInteger(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }
  return parsed;
}

/** Configuration required by the HTTP/auth application runtime. */
export const env = Object.freeze({
  ...databaseEnv,
  nodeEnv: optional("NODE_ENV", "development"),
  port: positiveInteger("PORT", 8000),
  jwtSecret: required("JWT_SECRET_KEY"),
  jwtExpires: optional("JWT_EXPIRES", "7d"),
  clientUrl: optional("CLIENT_URL", "http://localhost:3000"),
  corsOrigins: optional("CORS_ORIGINS", optional("CLIENT_URL", "http://localhost:3000"))
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
});

export type AppEnv = typeof env;
