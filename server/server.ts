import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import bodyParser from "body-parser";
import { env } from "./config/env";
import { connectDatabase } from "./confing/dbconfing";

const Productroute = require("./Routes/productRoute");
const userroute = require("./Routes/userRoute");
const shoprouter = require("./Routes/shopRoute");
const payment = require("./Routes/Payment");
const Errorhandler = require("./middlewares/error");

export const app = express();

app.use(cookieParser());
app.use(morgan("dev"));
app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));
app.use(cors({
  origin(origin, callback) {
    if (!origin || env.corsOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin not allowed by CORS"));
  },
  credentials: true,
}));
app.use("/", express.static("uploads"));
app.use(bodyParser.urlencoded({ extended: true, limit: "1mb" }));

app.use("/api/v2", userroute);
app.use("/api/v1", Productroute);
app.use("/api/v2", shoprouter);
app.use("/api/v2", payment);
app.use(Errorhandler);

async function start() {
  await connectDatabase(env.databaseUrl);
  app.listen(env.port, () => {
    console.log(`Backend server is running on port ${env.port}`);
  });
}

if (require.main === module) {
  start().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "Unknown startup error";
    console.error(`Application startup failed: ${message}`);
    process.exit(1);
  });
}
