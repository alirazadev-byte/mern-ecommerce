import React, { useState } from "react";
import { HiOutlineMinus, HiPlus } from "react-icons/hi";
import styles from "../styles/styles";
import { RxCross1 } from "react-icons/rx";
import { BsCart2 } from "react-icons/bs";
import { useSelector , useDispatch } from "react-redux";
import { toast } from "react-toastify";


const WishSingle = ({ product , removefromwishlisthandler , addtocarthandler }) => {
  
  const dispatch = useDispatch();
  
 
  const [value, setValue] = useState(product.qty);
  const totalPrice = product.price * value;
  
  return (
    <div className="border-b p-4">
      <div className="w-full flex items-center">
       
        <img
          src={`${product.images[0]}`}
          alt=""
          className="w-[130px] h-min  ml-2 mr-2 rounded-[5px]"
        />
        <div className="pl-[5px]">
          <h1>{product.name}</h1>
         <h3>Price :</h3> {product.price}
          
        </div>
        <div>
          <BsCart2 size={20} className="cursor-pointer ml-4" title="Add To Cart" onClick={() => addtocarthandler(product)} />
        </div>
        <div>
        <RxCross1 size={10} className="cursor-pointer ml-4" title="Remove from wishlist" onClick={() => removefromwishlisthandler(product)} />
        </div>
       
      </div>
    </div>
  );
};

export default WishSingle;
