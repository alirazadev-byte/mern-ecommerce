import React from "react";
import { RxCross1 } from "react-icons/rx";
import styles from "../styles/styles";
import { IoBagHandleSharp } from "react-icons/io5";
import CartSingle from "./CartSingle";
import { Link } from "react-router-dom";
import { addTOCart, removeFromCart } from "../redux/actions/cartactions";
import { useDispatch, useSelector } from "react-redux";

const Cart = ({ setopencartitem }) => {
  const { cart } = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  const removefromcarthandler = (product) => {
    dispatch(removeFromCart(product));
  };

  const totalprice = cart.reduce((acc, item) => {
    if (typeof item.price === 'number' && !isNaN(item.price)) {
      return acc + item.qty * item.price;
    } else {
      console.error('Invalid price:', item.price);
      return acc; 
    }
  }, 0);
  
  const quntitychangehandler = (product) => {
    dispatch(addTOCart(product));
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-[#0005] z-50">
      <div className="fixed top-0 right-0 min-h-full w-[25%] bg-white flex flex-col justify-between shadow-sm z-60">
        {cart && cart.length === 0 ? (
          <div className="w-full h-screen flex items-center justify-center">
            <div className="flex w-full justify-end pt-5 pr-5 fixed top-5 right-3">
              <RxCross1
                size={25}
                className="cursor-pointer"
                onClick={() => setopencartitem(false)}
              />
            </div>
            <h5>Cart Items Is Empty</h5>
          </div>
        ) : (
          <>
            <div>
              <div className="flex w-full justify-end pt-5 pr-5">
                <RxCross1
                  size={25}
                  className="cursor-pointer"
                  onClick={() => setopencartitem(false)}
                />
              </div>
              {/* items length */}
              <div className={`${styles.normalFlex} p-4`}>
                <IoBagHandleSharp size={25} />
                <h3 className="pl-2 text-[20px] font-[500]">
                  {cart && cart.length} items
                </h3>
              </div>
              {/* cart single items */}
              <div className="w-full border-t overflow-y-auto" style={{ maxHeight: '70vh' }}>
                {cart
                  ? cart.map((product, index) => (
                      <CartSingle
                        key={index}
                        product={product}
                        quntitychangehandler={quntitychangehandler}
                        removefromcarthandler={removefromcarthandler}
                      />
                    ))
                  : "No"}
              </div>
            </div>
            <div className="px-5 mb-3">
              {/* checkout button */}
              <Link to="/checkout">
                <div
                  className={`h-[45px] flex items-center justify-center w-[100%] bg-[#e44343] rounded-[5px]`}
                >
                  <h1 className="text-[#fff] text-[18px] font-[600]">
                    Check Out (USD${totalprice})
                  </h1>
                </div>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;
