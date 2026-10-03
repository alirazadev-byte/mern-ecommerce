import type { NextFunction, Request, Response } from "express";
import ErrorHandler = require("../utils/Errorhandler");
import { parseCheckoutRequest, requireIdempotencyKey } from "../validation/commerceValidation";
import { createCheckout } from "../services/checkoutService";
import { getCustomerOrder, listCustomerOrders, listVendorOrders, transitionVendorOrder, cancelPendingCustomerOrder } from "../services/orderService";
import { refundOrder } from "../services/refundService";
import { FULFILLMENT_STATUSES } from "../domain/commerce";
import { requireRouteParam } from "../validation/requestParams";
import { getStripeEnv } from "../config/stripeEnv";

function customer(req: Request) {
  if (!req.user || req.user.role !== "customer") throw new ErrorHandler("Customer authentication required", 401);
  return req.user;
}
function vendor(req: Request) {
  if (!req.seller) throw new ErrorHandler("Vendor authentication required", 401);
  return req.seller;
}

export async function checkout(req: Request, res: Response, next: NextFunction) {
  try {
    const actor = customer(req);
    const result = await createCheckout(actor._id, parseCheckoutRequest(req.body), requireIdempotencyKey(req));
    res.status(201).json({ success: true, checkout: result });
  } catch (error) { next(error); }
}

export async function customerOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const actor = customer(req);
    const result = await listCustomerOrders(actor._id, Number(req.query.page) || 1, Number(req.query.perPage) || 20);
    res.json({ success: true, ...result });
  } catch (error) { next(error); }
}

export async function customerOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await getCustomerOrder(customer(req)._id, requireRouteParam(req, "id"));
    if (!result) throw new ErrorHandler("Order not found", 404);
    res.json({ success: true, order: result });
  } catch (error) { next(error); }
}

export async function cancelCustomerOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await cancelPendingCustomerOrder(customer(req)._id, requireRouteParam(req, "id"));
    if (!result) throw new ErrorHandler("Order not found", 404);
    res.json({ success: true, order: result });
  } catch (error) { next(error); }
}

export async function vendorOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const actor = vendor(req);
    const result = await listVendorOrders(actor._id, Number(req.query.page) || 1, Number(req.query.perPage) || 20);
    res.json({ success: true, ...result });
  } catch (error) { next(error); }
}

async function transition(req: Request, res: Response, next: NextFunction, target: "processing" | "shipped" | "delivered") {
  try {
    const result = await transitionVendorOrder(vendor(req)._id, requireRouteParam(req, "id"), target);
    if (!result) throw new ErrorHandler("Vendor order not found", 404);
    res.json({ success: true, order: result });
  } catch (error) { next(error); }
}

export const processVendorOrder = (req: Request, res: Response, next: NextFunction) => transition(req, res, next, FULFILLMENT_STATUSES.PROCESSING);
export const shipVendorOrder = (req: Request, res: Response, next: NextFunction) => transition(req, res, next, FULFILLMENT_STATUSES.SHIPPED);
export const deliverVendorOrder = (req: Request, res: Response, next: NextFunction) => transition(req, res, next, FULFILLMENT_STATUSES.DELIVERED);

export async function adminRefund(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user || req.user.role !== "admin") throw new ErrorHandler("Admin authentication required", 401);
    const payment = await refundOrder(req.user._id, requireRouteParam(req, "id"), requireIdempotencyKey(req));
    res.json({ success: true, payment });
  } catch (error) { next(error); }
}

export function stripeConfig(_req: Request, res: Response) {
  const { publishableKey } = getStripeEnv();
  res.json({ success: true, publishableKey, stripeapikey: publishableKey });
}
