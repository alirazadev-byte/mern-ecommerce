const path = require("path");
const express = require("express");
const { upload } = require("../multer");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendMail");
const asyncHandler = require("../middlewares/Catachasyncerror");
const { error } = require("console");
const ErrorHandler = require("../utils/Errorhandler");
const { isAuthenticated, isSeller } = require("../middlewares/Auth");
const Catachasyncerror = require("../middlewares/Catachasyncerror");
const Shop = require("../models/Shop");
const shoprouter = express.Router();
const bcrypt = require("bcrypt");
const sendShopToken = require("../utils/shopToken");
// create shop
// Create shop
shoprouter.post(
  "/create-shop",
  upload.single("file"),
  async (req, res, next) => {
    try {
      const { email } = req.body;
      const sellerEmail = await Shop.findOne({ email });
      if (sellerEmail) {
        const filename = req.file.filename;
        const filePath = `uploads/${filename}`;
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ message: "Error deleting file" });
          }
          return next(new ErrorHandler("User already exists", 400));
        });
      } else {
        const filename = req.file.filename;
        const fileUrl = path.join(filename);
        const seller = {
          name: req.body.name,
          email: email,
          password: req.body.password,
          avatar: fileUrl,
          address: req.body.address,
          phonenumber: req.body.phonenumber,
          zipCode: req.body.zipCode,
        };
        const activationToken = createActivationToken(seller);
        const activationUrl = `${process.env.CLIENT_URL}/seller/activation/${activationToken}`;

        try {
          await sendEmail({
            email: seller.email,
            subject: "Activate your Account",
            message: `Hello ${seller.name}, please click on the link to activate your shop: ${activationUrl}`,
          });
          res.status(201).json({
            success: true,
            message: `Please check your email (${seller.email}) to activate your shop`,
          });
        } catch (error) {
          console.log(error.message);
          return next(new ErrorHandler(error.message, 400));
        }
      }
    } catch (error) {
      console.log(error.message);
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

shoprouter.get(
  "/getSeller",
  isSeller,
  asyncHandler(async (req, res, next) => {
    try {
      const seller = await Shop.findById(req.seller._id);

      if (!seller) {
        return next(new ErrorHandler("User doesn't exists", 400));
      }

      res.status(200).json({
        success: true,
        seller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Create Activation Account
const createActivationToken = (user) => {
  return jwt.sign(user, process.env.ACTIVATION_SECRET, {
    expiresIn: "7d",
  });
};

// Activation User

shoprouter.post(
  "/shop/activate",
  asyncHandler(async (req, res, next) => {
    try {
      const { activation_token } = req.body;

      // Create a new user in the database
      const newSeller = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET
      );

      if (!newSeller) {
        console.log(`invalid token`);
        return res.status(400).json({
          error: "User Is Already Exist",
        });
      }

      const { name, email, password, avatar, address, zipCode, phonenumber } =
        newSeller;
      let seller = await Shop.findOne({ email });
      if (seller) {
        return next(new ErrorHandler("User already exists", 400));
      }
      seller = await Shop.create({
        name,
        email,
        password,
        avatar,
        zipCode,
        address,
        phonenumber,
      });

      sendShopToken(seller, 201, res); // Pass the created user instance to sendToken
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  })
);
shoprouter.post(
  "/login-shop",
  asyncHandler(async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({
          error: "Please Fill All The Field",
        });
      }
      const seller = await Shop.findOne({ email }).select("+password");
      if (!seller) {
        return res.status(400).json({
          error: "User Of This Email Is Not Exist",
        });
      }
      const isPasswordValid = await seller.comparePassword(password);

      if (!isPasswordValid) {
        return res.status(400).json({
          error: "Please Enter The Correct Password",
        });
      }
      sendShopToken(seller, 200, res);
    } catch (error) {
      console.log(error.message);
    }
  })
);

module.exports = shoprouter;
