import axios from "axios";
import type { CheckoutRequestPayload, CheckoutResult, CustomerOrderResponse } from "../types/commerce";

const apiBaseUrl = (process.env.REACT_APP_API_BASE_URL || "http://localhost:9000").replace(/\/$/, "");
const client = axios.create({ baseURL: `${apiBaseUrl}/api/v2`, withCredentials: true });

export async function createCheckout(payload: CheckoutRequestPayload, idempotencyKey: string): Promise<CheckoutResult> {
  const response = await client.post<{ success: boolean; checkout: CheckoutResult }>("/checkout", payload, {
    headers: { "Idempotency-Key": idempotencyKey },
  });
  return response.data.checkout;
}

export async function getStripePublishableKey(): Promise<string> {
  const response = await client.get<{ publishableKey: string }>("/stripeApiKey");
  return response.data.publishableKey;
}

export async function getCustomerOrder(orderId: string): Promise<CustomerOrderResponse["order"]> {
  const response = await client.get<CustomerOrderResponse>(`/orders/${encodeURIComponent(orderId)}`);
  return response.data.order;
}

export async function listCustomerOrders(): Promise<import("../types/commerce").OrderListItem[]> {
  const response = await client.get<{ success: boolean; items: import("../types/commerce").OrderListItem[] }>("/orders");
  return response.data.items;
}

export async function listVendorOrders(): Promise<import("../types/commerce").VendorOrderListItem[]> {
  const response = await client.get<{ success: boolean; items: import("../types/commerce").VendorOrderListItem[] }>("/vendor/orders");
  return response.data.items;
}

export async function transitionVendorOrder(orderId: string, action: "process" | "ship" | "deliver"): Promise<void> {
  await client.post(`/vendor/orders/${encodeURIComponent(orderId)}/${action}`);
}
