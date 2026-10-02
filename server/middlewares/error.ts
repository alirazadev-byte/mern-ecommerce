import type { NextFunction, Request, Response } from "express";
import ErrorHandler = require("../utils/Errorhandler");
import type { ApiErrorBody } from "../types/api";

interface ErrorWithMetadata extends Error {
  statusCode?: number;
  code?: number | string;
  path?: string;
  keyValue?: Record<string, unknown>;
}

export = function errorMiddleware(err: ErrorWithMetadata, _req: Request, res: Response<ApiErrorBody>, _next: NextFunction) {
  let error = err;
  if (error.name === "CastError") error = new ErrorHandler(`Resource not found. Invalid ${error.path ?? "identifier"}`, 400, "INVALID_ID");
  if (error.code === 11000) error = new ErrorHandler(`Duplicate key: ${Object.keys(error.keyValue ?? {}).join(", ")}`, 409, "DUPLICATE_RESOURCE");
  if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") error = new ErrorHandler("Authentication token is invalid or expired", 401, "INVALID_TOKEN");

  const statusCode = "statusCode" in error && typeof error.statusCode === "number" ? error.statusCode : 500;
  const code = "code" in error && typeof error.code === "string" ? error.code : "INTERNAL_ERROR";
  const message = error.message || "Internal server error";

  res.status(statusCode).json({ success: false, message, error: { code, message } });
};
