export type CurrencyCode = "INR";

export interface OrderItemSnapshot {
  productId: string;
  vendorId: string;
  productName: string;
  sku?: string;
  image?: string;
  quantity: number;
  unitPriceMinor: number;
  currency: CurrencyCode;
}

export interface OrderAddressSnapshot {
  recipientName: string;
  phone?: string;
  country: string;
  city: string;
  address1: string;
  address2?: string;
  postalCode: string;
}

export const ORDER_STATUSES = {
  PENDING: "pending",
  PAYMENT_PENDING: "payment_pending",
  PAID: "paid",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
} as const;

export type OrderStatus =
  (typeof ORDER_STATUSES)[keyof typeof ORDER_STATUSES];
