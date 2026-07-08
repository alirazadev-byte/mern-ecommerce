import React, { useState } from "react";
import { HiOutlineMinus, HiPlus } from "react-icons/hi";
import styles from "../styles/styles";
import { RxCross1 } from "react-icons/rx";
import { toast } from "react-toastify";

const CartSingle = ({
  product,
  quntitychangehandler,
  removefromcarthandler,
}) => {
  const [value, setValue] = useState(product.qty);
  const totalPrice = product.price * value;

  const increment = (product) => {
    if (value < product.stock) {
      const newValue = value + 1;
      setValue(newValue);
      const updatecartdata = { ...product, qty: newValue };
      quntitychangehandler(updatecartdata);
    } else {
      toast.error("Product stock is limited");
    }
  };

  const decrement = (product) => {
    const newValue = value === 1 ? 1 : value - 1;
    setValue(newValue);
    const updatecartdata = { ...product, qty: newValue };
    quntitychangehandler(updatecartdata);
  };

  return (
    <div className="border-b p-4">
      <div className="w-full flex items-center">
        <div>
          <div
            className={`bg-[#e44343] border border-[#e4434373] rounded-full w-[25px] h-[25px] ${styles.normalFlex} justify-center cursor-pointer`}
            onClick={() => increment(product)}
          >
            <HiPlus size={18} color="#fff" />
          </div>
          <span className="pl-[10px]">{value}</span>
          <div
            className="bg-[#a7abb14f] rounded-full w-[25px] h-[25px] flex items-center justify-center cursor-pointer"
            onClick={() => decrement(product)}
          >
            <HiOutlineMinus size={16} color="#7d879c" />
          </div>
        </div>
        {product.images ? (
          <img
            src={`${product.images[0]}`}
            alt=""
            className="w-[130px] h-min ml-2 mr-2 rounded-[5px]"
          />
        ) : (
          "Loading..."
        )}
        <div className="pl-[5px]">
          <h1>{product.name}</h1>
          <h4 className="font-[400] text-[15px] text-[#00000082]">
            ${product.price} * {value}
          </h4>
          <h4 className="font-[600] text-[17px] pt-[3px] text-[#d02222] font-Roboto">
            US${totalPrice}
          </h4>
        </div>
        <RxCross1
          className="cursor-pointer"
          title="Remove from add to cart"
          onClick={() => removefromcarthandler(product)}
        />
      </div>
    </div>
  );
};

export default CartSingle;
