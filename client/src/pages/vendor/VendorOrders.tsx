import React, { useCallback, useEffect, useState } from "react";
import { listVendorOrders, transitionVendorOrder } from "../../api/commerce";
import type { VendorOrderListItem } from "../../types/commerce";

const nextAction = (status: VendorOrderListItem["status"]): "process" | "ship" | "deliver" | null => {
  if (status === "pending") return "process";
  if (status === "processing") return "ship";
  if (status === "shipped") return "deliver";
  return null;
};

const VendorOrders = () => {
  const [orders, setOrders] = useState<VendorOrderListItem[]>([]);
  const [error, setError] = useState(false);
  const load = useCallback(() => listVendorOrders().then(setOrders).catch(() => setError(true)), []);
  useEffect(() => { void load(); }, [load]);

  const advance = async (order: VendorOrderListItem) => {
    const action = nextAction(order.status);
    if (!action) return;
    await transitionVendorOrder(order._id, action);
    await load();
  };

  if (error) return <div className="p-8 text-center">Vendor orders are unavailable or you are not authenticated as a vendor.</div>;
  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Vendor fulfillment</h1>
      {!orders.length ? <p>No fulfillment orders yet.</p> : orders.map((order) => {
        const action = nextAction(order.status);
        return <div key={order._id} className="bg-white rounded-md p-4 shadow-sm mb-3">
          <div className="flex justify-between"><span>{order._id}</span><span>{order.status}</span></div>
          <div className="text-sm mt-2">{order.items.map((item) => `${item.productName} × ${item.quantity}`).join(", ")}</div>
          <div className="mt-2">{(order.totalMinor / 100).toFixed(2)} {order.currency}</div>
          {action && <button type="button" className="mt-3 px-4 py-2 bg-blue-600 text-white rounded" onClick={() => void advance(order)}>{action}</button>}
        </div>;
      })}
    </div>
  );
};
export default VendorOrders;
