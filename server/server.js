const express = require("express");
const cors = require("cors");
const app = express();
const dotenv = require("dotenv");
dotenv.config({ path: "./confing/confing.env" });
const port = process.env.PORT || 8000;
const morgan = require("morgan");
const DBconfing = require("./confing/dbconfing.js");
const Errorhandler = require("./middlewares/error.js");
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(morgan("dev"));
app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));

const allowedOrigins = (process.env.CORS_ORIGINS || process.env.CLIENT_URL || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Origin not allowed by CORS"));
  },
  credentials: true,
}));
app.use("/" , express.static("uploads"))
app.use(bodyParser.urlencoded({ extended: true, limit: "1mb" }));



// import route here
const Productroute = require("./Routes/productRoute.js");
const userroute = require("./Routes/userRoute.js");
const shoprouter = require("./Routes/shopRoute.js");
const payment = require("./Routes/Payment.js");
app.use("/api/v2" , userroute)
app.use("/api/v1", Productroute);
app.use('/api/v2',shoprouter)
app.use('/api/v2',payment)

app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});

// it is errorhandling
app.use(Errorhandler);

/* database */

DBconfing();
