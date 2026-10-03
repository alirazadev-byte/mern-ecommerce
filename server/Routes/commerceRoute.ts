import { Router } from "express";
import { authorizeRoles, isAuthenticated, isSeller } from "../middlewares/Auth";
import { ROLES } from "../domain/roles";
import {
  adminRefund, cancelCustomerOrder, checkout, customerOrder, customerOrders,
  deliverVendorOrder, processVendorOrder, shipVendorOrder, stripeConfig, vendorOrders,
} from "../controller/commerceController";

const router = Router();
router.get("/stripeApiKey", stripeConfig);
router.post("/checkout", isAuthenticated, authorizeRoles(ROLES.CUSTOMER), checkout);
router.get("/orders", isAuthenticated, authorizeRoles(ROLES.CUSTOMER), customerOrders);
router.get("/orders/:id", isAuthenticated, authorizeRoles(ROLES.CUSTOMER), customerOrder);
router.post("/orders/:id/cancel", isAuthenticated, authorizeRoles(ROLES.CUSTOMER), cancelCustomerOrder);
router.post("/orders/:id/refund", isAuthenticated, authorizeRoles(ROLES.ADMIN), adminRefund);
router.get("/vendor/orders", isSeller, vendorOrders);
router.post("/vendor/orders/:id/process", isSeller, processVendorOrder);
router.post("/vendor/orders/:id/ship", isSeller, shipVendorOrder);
router.post("/vendor/orders/:id/deliver", isSeller, deliverVendorOrder);
export = router;
