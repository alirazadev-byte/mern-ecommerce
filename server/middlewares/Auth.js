const Catachasyncerror = require("./Catachasyncerror");
const jwt = require("jsonwebtoken");
const Auth = require("../models/Auth");
const dotenv = require("dotenv");
dotenv.config({ path: "../confing/confing.env" });

exports.isAuthenticated = Catachasyncerror(async (req, res, next) => {
  const {token} = req.cookies // Extract the token from req.cookies

  console.log("Cookies:", token); // Log cookies for debugging
  try {
    if (!token) {
      throw new Error("JWT must be provided");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = await Auth.findById(decoded.id);

    if (!req.user) {
      console.log(`User not found for ID: ${decoded.id}`);
      return res.status(401).json({ message: "Unauthorized" });
    }

    // console.log("Authenticated user:", req.user);
    next();
  } catch (err) {
    console.log("JWT verification error:", err.message);
    return res.status(401).json({ message: "Unauthorized" });
  }
});

exports.isSeller = Catachasyncerror(async(req,res,next) => {
  const {seller_token} = req.cookies;
  if(!seller_token){
      return next(new ErrorHandler("Please login to continue", 401));
  }

  const decoded = jwt.verify(seller_token, process.env.JWT_SECRET_KEY);

  req.seller = await Shop.findById(decoded.id);

  next();
});