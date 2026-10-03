
qimport React, { useEffect, useState } from "react";
import { listCustomerOrders } from "../../api/commerce";
import type { OrderListItem } from "../../types/commerce";

const OrderHistory = () => {
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    listCustomerOrders().then(setOrders).catch(() => setError(true)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center">Loading orders...</div>;
  if (error) return <div className="p-8 text-center">Your orders could not be loaded.</div>;
  if (!orders.length) return <div className="p-8 text-center">You do not have any marketplace orders yet.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Your orders</h1>
      <div className="space-y-3">
        {orders.map((order) => (
          <div key={order._id} className="bg-white rounded-md p-4 shadow-sm flex justify-between">
            <div><div className="font-medium">Order {order._id}</div><div className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleString()}</div></div>
            <div className="text-right"><div className="font-medium">{(order.totalMinor / 100).toFixed(2)} {order.currency}</div><div className="text-sm">{order.status}</div></div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default OrderHistory;
