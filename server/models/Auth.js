const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { ROLES } = require("../authorization/roles");

const authSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    active: { type: Boolean, default: true },
    isAdmin: { type: Boolean, default: false },
    firstLogin: { type: Boolean, default: true },
    avatar: {},
    phonenumber: {
      type: Number,
    },
    addresses:[
      {
        country: {
          type: String,
        },
        city:{
          type: String,
        },
        address1:{
          type: String,
        },
        address2:{
          type: String,
        },
        zipCode:{
          type: Number,
        },
        addressType:{
          type: String,
        },
      }
    ],
    role: {
      type: String,
      enum: [ROLES.CUSTOMER, ROLES.ADMIN],
      default: ROLES.CUSTOMER,
    },
  },
  { timestamps: true }
);

authSchema.methods.generateJWT = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

// Hash Password
authSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 10);
});

// compare password
authSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Auth = mongoose.model("user", authSchema);
module.exports = Auth;
