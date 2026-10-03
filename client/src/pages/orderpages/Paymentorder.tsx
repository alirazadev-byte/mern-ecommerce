import React, { useEffect, useMemo, useState } from "react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { toast } from "react-toastify";
import { getStripePublishableKey } from "../../api/commerce";
import type { CheckoutResult } from "../../types/commerce";

function isCheckoutResult(value: unknown): value is CheckoutResult {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  const totals = record.totals;
  if (!totals || typeof totals !== "object") return false;
  const money = totals as Record<string, unknown>;
  return typeof record.orderId === "string"
    && typeof record.paymentIntentId === "string"
    && typeof record.clientSecret === "string"
    && typeof record.reservationExpiresAt === "string"
    && typeof money.subtotalMinor === "number"
    && typeof money.shippingMinor === "number"
    && typeof money.totalMinor === "number"
    && money.currency === "INR";
}

function readPendingCheckout(): CheckoutResult | null {
  const raw = sessionStorage.getItem("pendingCheckout");
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    return isCheckoutResult(value) ? value : null;
  } catch {
    return null;
  }
}

const PaymentForm = ({ checkout }: { checkout: CheckoutResult }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/order/success?orderId=${encodeURIComponent(checkout.orderId)}` },
      redirect: "if_required",
    });
    if (result.error) {
      toast.error(result.error.message ?? "Payment could not be confirmed.");
      setSubmitting(false);
      return;
    }
    window.location.assign(`/order/success?orderId=${encodeURIComponent(checkout.orderId)}`);
  };

  return (
    <form className="w-full 800px:w-[95%] bg-white rounded-md p-5" onSubmit={submit}>
      <PaymentElement />
      <button type="submit" disabled={!stripe || submitting} className="w-full h-[45px] bg-[#f63b60] text-white rounded-[5px] mt-6 disabled:opacity-50">
        {submitting ? "Confirming..." : "Pay securely"}
      </button>
      <p className="text-sm text-gray-600 mt-3">Payment is confirmed by Stripe webhook processing on the server, not by this browser page.</p>
    </form>
  );
};

const Paymentorder = () => {
  const [checkout] = useState<CheckoutResult | null>(() => readPendingCheckout());
  const [stripeInstance, setStripeInstance] = useState<Promise<Stripe | null> | null>(null);

  useEffect(() => {
    getStripePublishableKey()
      .then((key) => setStripeInstance(loadStripe(key)))
      .catch(() => toast.error("Payment configuration is unavailable."));
  }, []);

  const amount = useMemo(() => checkout ? (checkout.totals.totalMinor / 100).toFixed(2) : "0.00", [checkout]);
  if (!checkout) return <div className="p-8 text-center">No active checkout. Return to your cart and start checkout again.</div>;
  if (!stripeInstance) return <div className="p-8 text-center">Loading secure payment...</div>;

  return (
    <div className="w-full flex flex-col items-center py-8">
      <div className="w-[90%] 1000px:w-[70%] block 800px:flex gap-8">
        <div className="w-full 800px:w-[65%]">
          <Elements stripe={stripeInstance} options={{ clientSecret: checkout.clientSecret }}>
            <PaymentForm checkout={checkout} />
          </Elements>
        </div>
        <div className="w-full 800px:w-[35%] bg-white rounded-md p-5 pb-8">
          <h3 className="text-[18px] font-[600]">Server-calculated total</h3>
          <p className="mt-3">Subtotal: {(checkout.totals.subtotalMinor / 100).toFixed(2)} {checkout.totals.currency}</p>
          <p>Shipping: {(checkout.totals.shippingMinor / 100).toFixed(2)} {checkout.totals.currency}</p>
          <p className="font-semibold mt-2">Total: {amount} {checkout.totals.currency}</p>
        </div>
      </div>
    </div>
  );
};
export default Paymentorder;
