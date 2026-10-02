// userRoutes.js
const express = require("express");
const multer = require("multer");
const Auth = require("../models/Auth");
const userRoutes = express.Router();
const path = require("path");
const { upload } = require("../multer");
const fs = require("fs");
const cloudinary = require("cloudinary").v2
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendMail");
const sendToken = require("../utils/jwtToken");
const asyncHandler = require("../middlewares/Catachasyncerror");
const { error } = require("console");
const ErrorHandler = require("../utils/Errorhandler");
const { isAuthenticated, isSeller, authorizeRoles } = require("../middlewares/Auth");
const Catachasyncerror = require("../middlewares/Catachasyncerror");
const Product = require("../models/ProductModel");
// Create activation token
const createActivationToken = (user) => {
  return jwt.sign(user, process.env.ACTIVATION_SECRET, {
    expiresIn: "7d",
  });
};

// Multer configuration for multiple file uploads
const storage = multer.diskStorage({});
const uploadMultiple = multer({ storage });


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


// All Users Details
userRoutes.get("/all-users-record", isAuthenticated, authorizeRoles("admin"), asyncHandler(async (req, res) => {
  try {
    const users = await Auth.find();
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
}));
userRoutes.delete("/user/:id", isAuthenticated, authorizeRoles("admin"), asyncHandler(async (req, res) => {
  try {
    const user = await Auth.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
}))

userRoutes.post(
  "/create-user",
  upload.single("file"),
  async (req, res, next) => {
    const { name, email, password } = req.body;
    const userExists = await Auth.findOne({ email });
    const assignedRole = "customer";
    if (userExists) {
      const filename = req.file.filename;
      const filePath = `uploads/${filename}`;
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(err);
          res.status(500).json({ message: "Error deleting file" });
        }
        return next(new ErrorHandler("User already exists", 400));
      });
      console.log(`user already exists`);
    }

    const filename = req.file.filename;
    const fileUrl = path.join(filename);
    const user = {
      name: name,
      email: email,
      password: password,
      avatar: fileUrl,
      role : assignedRole
    };

    const activationToken = createActivationToken(user);
    const activationUrl = `${process.env.CLIENT_URL}/activation/${activationToken}`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Activate your Account",
        message: `Hello ${user.name}, please click on the link to activate your account: ${activationUrl}`,
      });
      res.status(201).json({
        success: true,
        message: `Please check your email (${user.email}) to activate your account`,
      });
    } catch (error) {
      console.log(error.message);
      return next(new ErrorHandler(error.message), 400);
    }
  }
);

userRoutes.post("/create-new-product", isSeller, uploadMultiple.array("files"), async (req, res, next) => {
  const { name, subtitle, brand, descriptoion, category, price, stock, productIsNew } = req.body;

  try {
    // Upload multiple images to Cloudinary
    const imageUploadPromises = req.files.map(file =>
      cloudinary.uploader.upload(file.path, { folder: "products" })
    );
    const imageUploadResponses = await Promise.all(imageUploadPromises);

    // Get the secure URLs of the uploaded images
    const images = imageUploadResponses.map(response => response.secure_url);

    // Create the product document
    const product = new Product({
      name,
      subtitle,
      brand,
      descriptoion,
      category,
      price,
      images,
      stock,
      productIsNew,
    });

    await product.save();

    res.status(201).json({ success: true, product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Route to activate user account
userRoutes.post(
  "/activation",
  asyncHandler(async (req, res, next) => {
    try {
      const { activation_token } = req.body;

      // Create a new user in the database
      const newUser = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET
      );

      if (!newUser) {
        console.log(`invalid token`);
        return res.status(400).json({
          error : "User Is Already Exist"
         })
      }

      const { name, email, password, avatar , role } = newUser;
      let user = await Auth.findOne({ email });
      if (user) {
        return next(new ErrorHandler("User already exists", 400));
      }
      user = await Auth.create({
        name,
        email,
        password,
        avatar,
        role: "customer"
      });

      sendToken(user, 201, res); // Pass the created user instance to sendToken
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  })
);

// login user
userRoutes.post(
  "/login-user",
  asyncHandler(async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
       return res.status(400).json({
        error : "Please Fill All The Field"
       })
      }
      const user = await Auth.findOne({ email }).select("+password");
      if (!user) {
        return res.status(400).json({
          error : "User Of This Email Is Not Exist"
         })
      }
      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return res.status(400).json({
          error : "Please Enter The Correct Password"
         })
      }
      sendToken(user, 200, res);

    } catch (error) {
      console.log(error.message);
    }
  })
);

// update user info
userRoutes.put(
  "/update-user",
  isAuthenticated,
  asyncHandler(async (req, res, next) => {
    try {
      const { email, password, phonenumber, name } = req.body;
      const user = await Auth.findOne({ email }).select("+password");
      if (!user) {
        return res.status(400).json({
          error : "User Of This Email Is Not Found"
         })
      }
      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return res.status(400).json({
          error : "Please Provide The Correct Information"
         })
      }

      user.name = name;
      user.phonenumber = phonenumber;
      user.email = user.email;
      await user.save();

      return res.status(201).json({
        success: true,
        user,
      });
    } catch (error) {}
  })
);
// load user
userRoutes.get("/getuser", isAuthenticated, async (req, res, next) => {
  try {
    if (!req.user) {
      console.log("User not authenticated");
      return res.status(400).json({
        message : "User Is Not Authenticated"
       })
    }
    const user = await Auth.findById(req.user._id);
    if (!user) {
      return res.status(400).json({
        message : "User Is Not Exist"
       })
    }
    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
});
//update user avatar
userRoutes.put(
  "/update-avatar",
  isAuthenticated,
  upload.single("image"),
  asyncHandler(async (req, res, next) => {
    try {
      const existUser = await Auth.findById(req.user.id);

      const existAvatar = `uploads/${existUser.avatar}`;

      fs.unlinkSync(existAvatar);

      const fileUrl = path.join(req.file.filename);

      const user = await Auth.findByIdAndUpdate(req.user.id, {
        avatar: fileUrl,
      });

      res.status(200).json({
        succes: true,
        user,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

userRoutes.get(
  "/logout", isAuthenticated,
  asyncHandler(async (req, res, next) => {
    try {
      res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
      });
      return res.status(200).json({
        success: true,
        message: "Logged out successfully"
      });
    } catch (error) {
      console.log(error);
    }
  })
);
// update user address
userRoutes.put(
  "/update-user-addresses",
  isAuthenticated,
  asyncHandler(async (req, res, next) => {
    try {
      const { country, city, address1, address2, zipCode, addressType } =
        req.body;

      // Ensure the user exists (already handled in the isAuthenticated middleware)
      const existUser = req.user;

      // Update the user's address
      existUser.addresses.push({
        country,
        city,
        address1,
        address2,
        zipCode,
        addressType,
      });

      // Save the updated user object
      await existUser.save();
      return res.status(400).json({
        message : "User Updated Successfully"
       })
    } catch (error) {
      console.error("Error updating address:", error);
      return res.status(400).json({
        message : "Internal Server Error"
       })
    }
  })
);

// change user password
userRoutes.put(
  "/update-password",
  isAuthenticated,
  asyncHandler(async (req, res) => {
    try {
      const existUser = req.user;
      const user = await Auth.findById(existUser).select("+password");

      if (!user) {
        return res.status(404).json({
          error: "User not found",
        });
      }

      const isPasswordMatched = await user.comparePassword(req.body.oldpassword);
      if (!isPasswordMatched) {
        return res.status(400).json({
          error: "Old password is incorrect",
        });
      }

      if (req.body.newpassword !== req.body.confirmpassword) {
        return res.status(400).json({
          error: "Passwords Does Not Matched With Each Other",
        });
      }

      user.password = req.body.newpassword;
      await user.save();

      return res.status(200).json({
        success: true,
        message: "Password updated successfully",
      });
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({
        error: "Internal server error",
      });
    }
  })
);


module.exports = userRoutes;
