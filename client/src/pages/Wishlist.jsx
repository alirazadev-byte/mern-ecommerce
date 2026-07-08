import React, { useState } from "react";
import { RxCross1 } from "react-icons/rx";
import styles from "../styles/styles";
import { HiOutlineHeart } from "react-icons/hi";
import { useSelector, useDispatch } from "react-redux";
import { removeFromwishlist } from "../redux/actions/wishlistactions";
import { toast } from "react-toastify";
import { addTOCart } from "../redux/actions/cartactions";
import WishSingle from "./Wishsingle";
import { Link } from "react-router-dom";

const Wishlist = ({ setopenwishlist }) => {
  const { wishlist } = useSelector((state) => state.wishlist);
  const { cart } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const [count, setcount] = useState(0);

  const removefromwishlisthandler = (product) => {
    dispatch(removeFromwishlist(product));
  };

  const addtocarthandler = (product) => {
    const isitemexist = cart && cart.find((i) => i._id === product._id);
    if (isitemexist) {
      toast.error("Item Is Already Exist");
    } else {
      const cartdata = { ...product, qty: count };
      dispatch(addTOCart(cartdata));
      toast.success("Item Add To Cart Successfully");
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full h-screen bg-[#0005] z-50">
      <div className="fixed top-0 right-0 min-h-full w-[25%] bg-white flex flex-col justify-between shadow-sm z-60">
        {wishlist && wishlist.length === 0 ? (
          <div className="w-full h-screen flex items-center justify-center">
            <div className="flex w-full justify-end pt-5 pr-5 fixed top-5 right-3">
              <RxCross1
                size={25}
                className="cursor-pointer"
                onClick={() => setopenwishlist(false)}
              />
            </div>
            <h5>Wishlist Items Is Empty</h5>
          </div>
        ) : (
          <>
            <div>
              <div className="flex w-full justify-end pt-5 pr-5">
                <RxCross1
                  size={25}
                  className="cursor-pointer"
                  onClick={() => setopenwishlist(false)}
                />
              </div>
              <div className={`${styles.normalFlex} p-4`}>
                <HiOutlineHeart size={25} />
                <h5 className="pl-2 text-[20px] font-[500]">
                  {wishlist && wishlist.length}
                </h5>
              </div>
              {/* wishlist single items */}
              <div className="w-full border-t overflow-y-auto" style={{ maxHeight: '70vh' }}>
                {wishlist
                  ? wishlist.map((product, index) => (
                      <WishSingle
                        key={index}
                        product={product}
                        removefromwishlisthandler={removefromwishlisthandler}
                        addtocarthandler={() => addtocarthandler(product)}
                      />
                    ))
                  : "No"}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
