import type { Request } from "express";
import ErrorHandler = require("../utils/Errorhandler");

export function requireRouteParam(req: Request, name: string): string {
  const value = req.params[name];
  if (typeof value !== "string" || value.trim() === "") {
    throw new ErrorHandler(`Missing route parameter: ${name}`, 400);
  }
  return value.trim();
}
