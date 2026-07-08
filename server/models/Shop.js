const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const shopSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    active: { type: Boolean, default: true },
    isAdmin: { type: Boolean, default: false },
    firstLogin: { type: Boolean, default: true },
    avatar: { type: String }, // Assuming URL for avatar
    phonenumber: { type: String },
    address: {
      type: String,
      required: true,
    },
    role: { type: String, default: "user" },
  },
  { timestamps: true }
);
shopSchema.methods.generateJWT = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

// Hash Password
shopSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  this.password = await bcrypt.hash(this.password, 10);
});
// Compare Password
shopSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
const Shop = mongoose.model("Shop", shopSchema);
module.exports = Shop;