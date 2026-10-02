import mongoose from "mongoose";

export async function connectDatabase(uri: string) {
  const connection = await mongoose.connect(uri);
  console.log(`DB Connected With ${connection.connection.host}`);
  return connection;
}
