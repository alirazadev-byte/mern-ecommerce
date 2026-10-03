import mongoose from "mongoose";
import { connectDatabase } from "../confing/dbconfing";
import { databaseEnv } from "../config/databaseEnv";

async function main() {
  await connectDatabase(databaseEnv.databaseUrl);
  const names = await mongoose.connection.db?.listCollections({ name: "orders" }).toArray();
  const count = names?.length ? await mongoose.connection.collection("orders").countDocuments() : 0;
  console.log(JSON.stringify({ legacyOrderCollection: "orders", legacyOrderCount: count, autoMigrated: false, reason: "Legacy orders contain client-authored identity/totals and generic snapshots, so they cannot be promoted to authoritative commerce records safely." }, null, 2));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}).finally(async () => mongoose.disconnect());
