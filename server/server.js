const express = require("express");
const cors = require("cors");
const app = express();
const dotenv = require("dotenv");
dotenv.config({ path: "./confing/confing.env" });
const port = process.env.PORT;
const morgan = require("morgan");
const DBconfing = require("./confing/dbconfing.js");
const Errorhandler = require("./middlewares/error.js");
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(morgan("dev"));
app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000", // frontend URL
  credentials: true,
}));
app.use("/" , express.static("uploads"))
app.use(bodyParser.urlencoded( { extended: true } ));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));



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
