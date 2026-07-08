import React, { useState , useEffect } from "react";
import { BiExpand } from "react-icons/bi";
import { IoCartOutline } from "react-icons/io5";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { addTOCart } from "../redux/actions/cartactions";
import {
  removeFromwishlist,
  addTOwishlist,
} from "../redux/actions/wishlistactions";


const ProductCard = ({ product, loading }) => {
  const { id } = useParams();

  const [click, setclick] = useState(false);
  const [open, setopen] = useState(false);
  const [count, setcount] = useState(1);

  const [cartPlusDisabled, setCartPlusDisabled] = useState(false);
  const dispatch = useDispatch();

  const { cart } = useSelector((state) => state.cart);
  const { wishlist } = useSelector((state) => state.wishlist);

  const addtocarthandler = (id) => {
    const isitemexist = cart && cart.find((i) => i._id === id);
    if (isitemexist) {
      toast.error("Item Is Already Exist");
    } else {
      if (product.stock < count) {
        toast.error("Product stock Limited!");
      } else {
        const cartData = { ...product, qty: count };
        dispatch(addTOCart(cartData));
        toast.success("Item added to cart successfully! ");
      }
    }
  };

  useEffect(() => {
   if(wishlist && wishlist.find((i) => i._id === product._id)) {
    setclick(true)
   } else {
    setclick(false)
   }
    
   
  }, [wishlist]);
  const removefromwishlisthandler = (product) => {
    setclick(!click);
    dispatch(removeFromwishlist(product));
  };
  const addtowishlisthandler = (product) => {
    setclick(!click);
    dispatch(addTOwishlist(product));
  };

  return (
    <div isLoaded={!loading}>
      <div class="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 mb-9 h-[420px] ">
        <h5 class="mb-2  font-bold tracking-tight">
          {" "}
          {product.stock >= 1 && product.stock < 5 ? (
            <div className=" text-yellow-900 "> only {product.stock} left </div>
          ) : product.stock === 0 ? (
            <div className="text-red-900"> Sold out </div>
          ) : (
            <div className="text-green-900"> In Stock </div>
          )}{" "}
        </h5>
        <Link to={`/product/${product._id}`}>
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-48 w-56 m-auto items-center "
          />
        </Link>

        {product.productIsNew && <div ml="2"> New </div>}

        <p class="mb-3 font-normal  text-center">
          <div justify="space-between" alignItems="center" mt="2">
            <div className="py-2 text-2xl"> Catagorey :{product.category}</div>
            <div className="py-2 text-2xl">
              <h4 className="font-[500] text-[16px] text-[#d55b45] pl-3 mt-[-4px] line-trough">
                Price : {product.price} Rs
              </h4>
            </div>
          </div>
        </p>

        <div className="flex items-center justify-between">
          <div>
            {click ? (
              <AiFillHeart
                size={25}
                className="cursor-pointer"
                onClick={() => removefromwishlisthandler(product)}
                color={click ? "red" : "#333"}
                title="Remove from wish list"
              />
            ) : (
              <AiOutlineHeart
                size={25}
                className="cursor-pointer"
                onClick={() => addtowishlisthandler(product)}
                color={click ? "red" : "#333"}
                title="Remove from wish list"
              />
            )}
          </div>
          <Link to={`/product/${product._id}`}>
            <BiExpand
              size={22}
              className="cursor-pointer  ml-11 "
              onClick={() => setopen(!open)}
              color="#333"
              title="View More"
            />
          </Link>
          <button>
            <IoCartOutline
              disabled={product.stock <= 0 || cartPlusDisabled}
              size={22}
              className="cursor-pointer  ml-11 "
              color="#333"
              title="Add to card"
              onClick={() => addtocarthandler(product._id)}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
