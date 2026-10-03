export type CurrencyCode = "INR";

export interface Money {
  amountMinor: number;
  currency: CurrencyCode;
}

export interface CheckoutItemInput {
  productId: string;
  quantity: number;
}

export interface ShippingAddressInput {
  recipientName: string;
  email: string;
  phone?: string;
  country: string;
  city: string;
  address1: string;
  address2?: string;
  postalCode: string;
}

export interface CheckoutRequest {
  items: CheckoutItemInput[];
  shippingAddress: ShippingAddressInput;
}

export interface OrderItemSnapshot {
  productId: string;
  vendorId: string;
  sku: string;
  productName: string;
  image?: string;
  quantity: number;
  unitPriceMinor: number;
  lineTotalMinor: number;
  currency: CurrencyCode;
}

export const MARKETPLACE_ORDER_STATUSES = {
  PAYMENT_PENDING: "payment_pending",
  PAID: "paid",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
} as const;
export type MarketplaceOrderStatus = typeof MARKETPLACE_ORDER_STATUSES[keyof typeof MARKETPLACE_ORDER_STATUSES];

export const FULFILLMENT_STATUSES = {
  PENDING: "pending",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
} as const;
export type FulfillmentStatus = typeof FULFILLMENT_STATUSES[keyof typeof FULFILLMENT_STATUSES];

export const PAYMENT_STATUSES = {
  PENDING: "pending",
  REQUIRES_ACTION: "requires_action",
  PROCESSING: "processing",
  PAID: "paid",
  FAILED: "failed",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
} as const;
export type PaymentStatus = typeof PAYMENT_STATUSES[keyof typeof PAYMENT_STATUSES];

export const IDEMPOTENCY_SCOPES = {
  CHECKOUT: "checkout",
  REFUND: "refund",
} as const;
export type IdempotencyScope = typeof IDEMPOTENCY_SCOPES[keyof typeof IDEMPOTENCY_SCOPES];

export const RESERVATION_TTL_MINUTES = 30;


export const MARKETPLACE_ORDER_TRANSITIONS: Readonly<Record<MarketplaceOrderStatus, readonly MarketplaceOrderStatus[]>> = {
  payment_pending: ["paid", "cancelled"],
  paid: ["refunded"],
  cancelled: ["refunded"],
  refunded: [],
};

export const PAYMENT_TRANSITIONS: Readonly<Record<PaymentStatus, readonly PaymentStatus[]>> = {
  pending: ["requires_action", "processing", "paid", "failed", "cancelled"],
  requires_action: ["processing", "paid", "failed", "cancelled"],
  processing: ["paid", "failed", "cancelled"],
  failed: ["requires_action", "processing", "paid", "cancelled"],
  paid: ["refunded"],
  cancelled: ["refunded"],
  refunded: [],
};

export function canTransitionMarketplaceOrder(from: MarketplaceOrderStatus, to: MarketplaceOrderStatus): boolean {
  return MARKETPLACE_ORDER_TRANSITIONS[from].includes(to);
}

export function canTransitionPayment(from: PaymentStatus, to: PaymentStatus): boolean {
  return PAYMENT_TRANSITIONS[from].includes(to);
}
export const FULFILLMENT_TRANSITIONS: Readonly<Record<FulfillmentStatus, readonly FulfillmentStatus[]>> = {
  pending: ["processing"],
  processing: ["shipped"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export function canTransitionFulfillment(from: FulfillmentStatus, to: FulfillmentStatus): boolean {
  return FULFILLMENT_TRANSITIONS[from].includes(to);
}

export interface MarketplaceOrderRecord {
  customer: import("mongoose").Types.ObjectId;
  status: MarketplaceOrderStatus;
  currency: "INR";
  subtotalMinor: number;
  shippingMinor: number;
  discountMinor: number;
  taxMinor: number;
  totalMinor: number;
  shippingAddress: ShippingAddressInput;
  reservationExpiresAt: Date;
  inventoryReleased: boolean;
  checkoutIdempotencyKey: string;
  paidAt?: Date;
  cancelledAt?: Date;
  refundedAt?: Date;
}

export interface PaymentRecord {
  marketplaceOrder: import("mongoose").Types.ObjectId;
  customer: import("mongoose").Types.ObjectId;
  provider: "stripe";
  paymentIntentId?: string;
  status: PaymentStatus;
  amountMinor: number;
  currency: "INR";
  refundedMinor: number;
  lastFailureCode?: string;
  lastFailureMessage?: string;
}
