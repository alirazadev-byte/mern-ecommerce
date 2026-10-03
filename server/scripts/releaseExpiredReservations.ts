import mongoose from "mongoose";
import { connectDatabase } from "../confing/dbconfing";
import { databaseEnv } from "../config/databaseEnv";
import { cleanupExpiredReservations } from "../services/reservationCleanupService";

async function main() {
  await connectDatabase(databaseEnv.databaseUrl);
  const released = await cleanupExpiredReservations(500);
  console.log(`Released ${released} expired checkout reservation(s).`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}).finally(async () => mongoose.disconnect());
