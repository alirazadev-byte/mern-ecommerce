import dotenv from "dotenv";

// Prefer a conventional local .env file while retaining the historical config
// path as a fallback during the migration to the new TypeScript runtime.
dotenv.config();
dotenv.config({ path: "./confing/confing.env", override: false });

function databaseUrl(): string {
  return process.env.MONGODB_CLOUD?.trim()
    || process.env.MONGODB_URL?.trim()
    || "mongodb://127.0.0.1:27017/mern-ecommerce";
}

/** Configuration required by database-only operational commands. */
export const databaseEnv = Object.freeze({
  databaseUrl: databaseUrl(),
});

export type DatabaseEnv = typeof databaseEnv;
