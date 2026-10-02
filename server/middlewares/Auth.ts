import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import Auth = require("../models/Auth");
import Shop = require("../models/Shop");
import asyncHandler = require("./Catachasyncerror");
import ErrorHandler = require("../utils/Errorhandler");
import { env } from "../config/env";
import { ROLES, hasAllowedRole, type Role } from "../domain/roles";

interface JwtPayloadWithId extends jwt.JwtPayload {
  id: string;
}

function decodeId(token: string): string {
  const decoded = jwt.verify(token, env.jwtSecret);
  if (typeof decoded === "string" || typeof decoded.id !== "string") {
    throw new Error("Invalid token payload");
  }
  return (decoded as JwtPayloadWithId).id;
}

export const isAuthenticated = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const token = req.cookies?.token as string | undefined;
  if (!token) return next(new ErrorHandler("Authentication required", 401));

  try {
    const user = await Auth.findById(decodeId(token));
    if (!user || !user.active) return next(new ErrorHandler("Authentication required", 401));
    req.user = user;
    return next();
  } catch {
    return next(new ErrorHandler("Authentication required", 401));
  }
});

export const authorizeRoles = (...roles: Role[]) => (req: Request, _res: Response, next: NextFunction) => {
  if (!hasAllowedRole(req.user, roles)) {
    return next(new ErrorHandler("You are not authorized to access this resource", 403));
  }
  return next();
};

export const isSeller = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const token = req.cookies?.seller_token as string | undefined;
  if (!token) return next(new ErrorHandler("Seller authentication required", 401));

  try {
    const seller = await Shop.findById(decodeId(token));
    if (!seller || !seller.active || seller.role !== ROLES.VENDOR) {
      return next(new ErrorHandler("Seller authentication required", 401));
    }
    req.seller = seller;
    return next();
  } catch {
    return next(new ErrorHandler("Seller authentication required", 401));
  }
});
