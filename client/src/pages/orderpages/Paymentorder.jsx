import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import styles from "../../styles/styles";
import { useNavigate } from "react-router-dom";

const Paymentorder = () => {
  const [orderData, setOrderData] = useState(null); // Changed initial state to null
  useEffect(() => {
    const orderData = JSON.parse(localStorage.getItem("latestOrder"));
    setOrderData(orderData);
  }, []);
  
  return (
    <div className="w-full flex flex-col items-center py-8">
      <div className="w-[90%] 1000px:w-[70%] block 800px:flex">
        <div className="w-full 800px:w-[65%]">
          <Paymentinfo />
        </div>
        <div className="w-full 800px:w-[35%] 800px:mt-0 mt-8">
          <Carddata orderData={orderData} />
        </div>
      </div>
    </div>
  );
};

const Carddata = ({ orderData }) => {
  const [couponCode, setCouponCode] = useState("");
  const [couponCodeData, setCouponCodeData] = useState(null);
  const { cart } = useSelector((state) => state.cart);

  const subTotalPrice = cart.reduce(
    (acc, item) => acc + item.qty * item.price,
    0
  );
  const shipping = subTotalPrice * 0.1;
  const totalPrice = couponCodeData
    ? (subTotalPrice + shipping).toFixed(2)
    : (subTotalPrice + shipping).toFixed(2);

  return (
    <div className="w-full bg-[#fff] rounded-md p-5 pb-8">
      <div className="flex justify-between">
        <h3 className="text-[18px] font-[600] ">Subtotal</h3>
        <h5 className="text-[16px] font-[600]">${orderData?.subTotalPrice}</h5>
      </div>
      <br />
      <div className="flex justify-between">
        <h3 className="text-[18px] font-[600] ">Shipping</h3>
        <h5 className="text-[16px] font-[600]">
          ${typeof orderData?.shipping === "number" ? orderData.shipping.toFixed(2) : "0.00"}
        </h5>
      </div>
      <br />
      <div className="flex justify-between">
        <h3 className="text-[18px] font-[600] ">Total Price</h3>
        <h5 className="text-[16px] font-[600]">
          ${typeof orderData?.totalPrice === "number" ? orderData.totalPrice.toFixed(2) : "0.00"}
        </h5>
      </div>
      <br />
      <form>
        <input
          type="text"
          className={`${styles.input} h-[40px] w-[75%] pl-2`}
          placeholder="Coupon Code"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          required
        />
        <input
          className={`w-full h-[40px] border border-[#f63b60] text-center text-[#f63b60] rounded-[3px] mt-8 cursor-pointer`}
          value="Apply code"
          type="submit"
        />
      </form>
    </div>
  );
};

const Paymentinfo = () => {
  const [select, setSelect] = useState(1);
  const navigate = useNavigate();

  const paymentHandler = (e) => {
    e.preventDefault();
    navigate("/order/success");
  };
  
  return (
    <div className="w-full 800px:w-[95%] bg-[#fff] rounded-md pb-8">
      <div>
        <div className="flex w-full pb-5 border-b mb-2">
          <div
            className="w-[25px] h-[25px] rounded-full bg-transparent border-[3px] border-[#1f1a1ab4] relative flex items-center justify-center"
            onClick={() => setSelect(1)}
          >
            {select === 1 ? (
              <div className="w-[13px] h-[13px] bg-[#1d1a1acb] rounded-full" />
            ) : null}
          </div>
          <h4 className="text-[18px] pl-2 font-[600] text-[#000000bl]">
            Pay With Debit/Credit Card
          </h4>
        </div>
        {select === 1 ? (
          <div className="w-full flex border-b">
            <form className="w-full" onSubmit={paymentHandler}>
              <div className="w-full flex pb-3">
                <div className="w-[50%]">
                  <label className="block pb-2">Card Number</label>
                  <input required className={`${styles.input} w-[95%]`} />
                </div>
                <div className="w-[50%]">
                  <label className="block pb-2">Exp Date</label>
                  <input
                    type="number"
                    required
                    className={`${styles.input} w-[95%]`}
                  />
                </div>
              </div>
              <div className="w-full flex pb-3">
                <div className="w-[50%]">
                  <label className="block pb-2">Name On Card</label>
                  <input required className={`${styles.input} w-[95%]`} />
                </div>
                <div className="w-[50%]">
                  <label className="block pb-2">Billing Address</label>
                  <input
                    type="text"
                    required
                    className={`${styles.input} w-[95%]`}
                  />
                </div>
              </div>
              <input
                type="submit"
                value="Submit"
                className={`${styles.button} !bg-[#f63b60] text-[#fff] h-[45px] rounded-[5px] cursor-pointer text-[18px] font-[600]`}
              />
            </form>
          </div>
        ) : null}
        <div>
          <div className="flex w-full border-b mb-2">
            <div
              className="w-[25px] h-[25px] rounded-full bg-transparent border-[3px] border-[#1f1a1ab4] relative flex items-center justify-center"
              onClick={() => setSelect(2)}
            >
              {select === 2 ? (
                <div className="w-[13px] h-[13px] bg-[#1d1a1acb] rounded-full" />
              ) : null}
            </div>
            <h4 className="text-[18px] pl-2 font-[600] text-[#000000bl]">
              Pay With Paypal
            </h4>
          </div>
          {select === 2 ? (
            <div className="w-full flex border-b">
              <form className="w-full" onSubmit={paymentHandler}>
                <div className="w-full flex pb-3">
                  <label className="block pb-2 pl-3">Paypal Email</label>
                  <input required className={`${styles.input} w-[75%] ml-4`} />
                </div>
                <input
                  type="submit"
                  value="Submit"
                  className={`${styles.button} !bg-[#f63b60] text-[#fff] h-[45px] rounded-[5px] cursor-pointer text-[18px] font-[600]`}
                />
              </form>
            </div>
          ) : null}
        </div>
        <br />
        <div>
          <div className="flex w-full border-b mb-2">
            <div
              className="w-[25px] h-[25px] rounded-full bg-transparent border-[3px] border-[#1f1a1ab4] relative flex items-center justify-center"
              onClick={() => setSelect(3)}
            >
              {select === 3 ? (
                <div className="w-[13px] h-[13px] bg-[#1d1a1acb] rounded-full" />
              ) : null}
            </div>
            <h4 className="text-[18px] pl-2 font-[600] text-[#000000bl]">
              Cash On Delivery
            </h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Paymentorder;
