const jwt = require("jsonwebtoken");
const Catachasyncerror = require("./Catachasyncerror");
const Auth = require("../models/Auth");
const Shop = require("../models/Shop");
const ErrorHandler = require("../utils/Errorhandler");
const { ROLES, hasAllowedRole } = require("../authorization/roles");

exports.isAuthenticated = Catachasyncerror(async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return next(new ErrorHandler("Authentication required", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await Auth.findById(decoded.id);

    if (!user || !user.active) {
      return next(new ErrorHandler("Authentication required", 401));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new ErrorHandler("Authentication required", 401));
  }
});

exports.authorizeRoles = (...roles) => (req, res, next) => {
  if (!hasAllowedRole(req.user, roles)) {
    return next(new ErrorHandler("You are not authorized to access this resource", 403));
  }

  next();
};

exports.isSeller = Catachasyncerror(async (req, res, next) => {
  const sellerToken = req.cookies?.seller_token;

  if (!sellerToken) {
    return next(new ErrorHandler("Seller authentication required", 401));
  }

  try {
    const decoded = jwt.verify(sellerToken, process.env.JWT_SECRET_KEY);
    const seller = await Shop.findById(decoded.id);

    if (!seller || !seller.active || seller.role !== ROLES.VENDOR) {
      return next(new ErrorHandler("Seller authentication required", 401));
    }

    req.seller = seller;
    next();
  } catch (error) {
    return next(new ErrorHandler("Seller authentication required", 401));
  }
});
