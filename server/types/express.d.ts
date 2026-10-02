import type { Types } from "mongoose";
import type { Role } from "../domain/roles";

export interface AuthenticatedUserContext {
  _id: Types.ObjectId;
  role: Extract<Role, "customer" | "admin">;
  active: boolean;
}

export interface AuthenticatedVendorContext {
  _id: Types.ObjectId;
  role: "vendor";
  active: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUserContext;
      seller?: AuthenticatedVendorContext;
    }
  }
}

export {};
