import React, { useState } from "react";
import { Country, State } from "country-state-city";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import styles from "../styles/styles";
import { createCheckout } from "../api/commerce";
import type { CheckoutCartItem } from "../types/commerce";

interface UserLike { name?: string; email?: string; phonenumber?: string; phoneNumber?: string; }
interface CartItemLike extends CheckoutCartItem { name?: string; price?: number; }
interface RootStateLike { user: { user: UserLike | null }; cart: { cart: CartItemLike[] }; }

function newIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const Checkout = () => {
  const user = useSelector((state: RootStateLike) => state.user.user);
  const cart = useSelector((state: RootStateLike) => state.cart.cart);
  const navigate = useNavigate();
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const paymentSubmit = async () => {
    if (!user?.name || !user.email || !country || !city || !address1 || !postalCode || cart.length === 0) {
      toast.error("Please complete your delivery address and cart.");
      return;
    }
    setSubmitting(true);
    try {
      const checkout = await createCheckout({
        items: cart.map((item) => ({ productId: item._id, quantity: item.qty })),
        shippingAddress: {
          recipientName: user.name,
          email: user.email,
          phone: user.phonenumber ?? user.phoneNumber,
          country,
          city,
          address1,
          address2: address2 || undefined,
          postalCode,
        },
      }, newIdempotencyKey());
      sessionStorage.setItem("pendingCheckout", JSON.stringify(checkout));
      navigate("/payment");
    } catch {
      toast.error("Checkout could not be created. Product availability may have changed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center py-8">
      <div className="w-[90%] 1000px:w-[70%] block 800px:flex gap-8">
        <div className="w-full 800px:w-[65%] bg-white rounded-md p-5 pb-8">
          <h5 className="text-[18px] font-[500]">Shipping Address</h5><br />
          <div className="w-full flex pb-3 gap-3">
            <input className={styles.input} value={user?.name ?? ""} readOnly aria-label="Full name" />
            <input className={styles.input} value={user?.email ?? ""} readOnly aria-label="Email" />
          </div>
          <div className="w-full flex pb-3 gap-3">
            <input className={styles.input} value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="Postal code" />
            <select className="w-full border h-[40px] rounded-[5px]" value={country} onChange={(e) => { setCountry(e.target.value); setCity(""); }}>
              <option value="">Choose country</option>
              {Country.getAllCountries().map((item) => <option key={item.isoCode} value={item.isoCode}>{item.name}</option>)}
            </select>
          </div>
          <div className="w-full flex pb-3 gap-3">
            <select className="w-full border h-[40px] rounded-[5px]" value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="">Choose city/state</option>
              {State.getStatesOfCountry(country).map((item) => <option key={item.isoCode} value={item.isoCode}>{item.name}</option>)}
            </select>
            <input className={styles.input} value={address1} onChange={(e) => setAddress1(e.target.value)} placeholder="Address" />
          </div>
          <input className={styles.input} value={address2} onChange={(e) => setAddress2(e.target.value)} placeholder="Address 2 (optional)" />
        </div>
        <div className="w-full 800px:w-[35%] bg-white rounded-md p-5 pb-8">
          <h3 className="text-[18px] font-[600]">Order summary</h3>
          <p className="mt-3">{cart.length} line item(s)</p>
          <p className="text-sm text-gray-600 mt-2">Authoritative prices, shipping and availability are recalculated by the server when you continue.</p>
        </div>
      </div>
      <button type="button" disabled={submitting} className={`${styles.button} w-[280px] mt-10 text-white disabled:opacity-50`} onClick={paymentSubmit}>
        {submitting ? "Preparing checkout..." : "Continue to secure payment"}
      </button>
    </div>
  );
};
export default Checkout;
