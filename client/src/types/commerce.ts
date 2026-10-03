export interface CheckoutCartItem { _id: string; qty: number; }
export interface CheckoutAddress {
  recipientName: string;
  email: string;
  phone?: string;
  country: string;
  city: string;
  address1: string;
  address2?: string;
  postalCode: string;
}
export interface CheckoutRequestPayload {
  items: Array<{ productId: string; quantity: number }>;
  shippingAddress: CheckoutAddress;
}
export interface CheckoutResult {
  orderId: string;
  paymentIntentId: string;
  clientSecret: string;
  status: string;
  totals: {
    subtotalMinor: number;
    shippingMinor: number;
    discountMinor: number;
    taxMinor: number;
    totalMinor: number;
    currency: "INR";
  };
  reservationExpiresAt: string;
}
export interface CustomerOrderResponse {
  success: boolean;
  order: {
    _id: string;
    status: string;
    totalMinor: number;
    currency: "INR";
    payment?: { status: string } | null;
  };
}

export interface OrderListItem {
  _id: string;
  status: string;
  totalMinor: number;
  currency: "INR";
  createdAt: string;
}

export interface VendorOrderListItem {
  _id: string;
  marketplaceOrder: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  subtotalMinor: number;
  shippingMinor: number;
  totalMinor: number;
  currency: "INR";
  items: Array<{ productId: string; productName: string; quantity: number; sku: string }>;
  shippingAddress: CheckoutAddress;
  createdAt: string;
}
