import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getCustomerOrder } from "../api/commerce";

const Success = () => {
  const [params] = useSearchParams();
  const orderId = params.get("orderId");
  const [status, setStatus] = useState<string>("checking");

  useEffect(() => {
    if (!orderId) { setStatus("missing"); return; }
    let cancelled = false;
    let attempts = 0;
    const check = async () => {
      attempts += 1;
      try {
        const order = await getCustomerOrder(orderId);
        if (!cancelled) setStatus(order.status);
        if (!cancelled && order.status === "payment_pending" && attempts < 6) setTimeout(check, 1500);
      } catch {
        if (!cancelled) setStatus("unknown");
      }
    };
    void check();
    return () => { cancelled = true; };
  }, [orderId]);

  const paid = status === "paid";
  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-lg">
        <h2 className="text-2xl font-semibold text-center mb-4">{paid ? "Payment confirmed" : "Payment submitted"}</h2>
        <p className="text-gray-700 text-center">
          {paid ? "Stripe has confirmed your payment and your order is ready for fulfillment." : "We are waiting for trusted payment confirmation from Stripe. Refresh your orders if this status does not update shortly."}
        </p>
        {orderId && <p className="text-xs text-gray-500 text-center mt-4">Order: {orderId}</p>}
      </div>
    </div>
  );
};
export default Success;
