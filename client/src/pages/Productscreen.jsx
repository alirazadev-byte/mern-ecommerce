import { AiOutlineMessage } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { fetchProductById } from "../redux/actions/productActions";
import { useEffect, useState } from "react";
import styles from "../styles/styles";
import ProductDetailsinfo from "./ProductDetailsinfo";
import Rating from "../component/Rating";
import Relatedproduct from "./Relatedproduct";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { toast } from "react-toastify";
import { addTOCart } from "../redux/actions/cartactions";
import { removeFromwishlist, addTOwishlist } from "../redux/actions/wishlistactions";

const Productscreen = () => {
  const dispatch = useDispatch();
  const [count, setCount] = useState(1); // Initialize count to 1
  const [click, setClick] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0); // State to track selected image index
  const navigate = useNavigate();

  const handleMessageSubmit = () => {
    navigate("/inbox?conversation=DFkajfILGLiufgiql799793");
  };
  
  const removeFromWishlistHandler = (product) => {
    setClick(!click);
    dispatch(removeFromwishlist(product));
  };

  const addToWishlistHandler = (product) => {
    setClick(!click);
    dispatch(addTOwishlist(product));
  };

  const { cart } = useSelector((state) => state.cart);
  const { wishlist } = useSelector((state) => state.wishlist);

  const addToCartHandler = (id) => {
    const isItemExist = cart && cart.find((i) => i._id === id);
    if (isItemExist) {
      toast.error("Item is already in the cart");
    } else {
      const cartData = { ...product, qty: count };
      dispatch(addTOCart(cartData));
      toast.success("Item added to cart successfully");
    }
  };

  const { id } = useParams();
  const { loading, error, product, reviewed } = useSelector((state) => state.product);

  useEffect(() => {
    dispatch(fetchProductById(id));
    if (wishlist && wishlist.find((i) => i._id === product._id)) {
      setClick(true);
    } else {
      setClick(false);
    }
  }, [dispatch, wishlist, id, product._id]);

  const changeAmount = (input) => {
    if (input === "plus") {
      setCount(count + 1);
    }
    if (input === "minus" && count > 1) {
      setCount(count - 1);
    }
  };

  return (
    <div className={`${styles.Secction} w-[90%] 800px:w-[80%]`}>
      <div className="w-full py-5">
        <div className="block w-full 800px:flex">
          {product.images ? (
            <div className="w-full 800px:w-[50%] mt-4">
              <img
                src={product.images[selectedImageIndex]}
                alt={product.name}
                className="w-[50%] m-auto h-[400px]"
              />
              <div className="w-full flex">
                {product.images.map((image, index) => (
                  <div
                    key={index}
                    className={`${selectedImageIndex === index ? "border" : ""} cursor-pointer`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img
                      src={image}
                      alt={product.name}
                      className="h-50 w-40 mt-4 ml-2"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            "Loading........."
          )}
          <div className="w-full 800px:w-[50%] pt-10">
            <h1 className={`${styles.producttitle}`}>{product.name}</h1>
            <h1>Stock: {product.stock}</h1>
            <p>{product.description}</p>
            <div className="flex pt-3 mb-2 font-semibold">
              Price: ${product.price}
            </div>
            <div>
              <b>Rating:</b>
              <Rating product={product} />
            </div>
            <div className="flex items-center mt-12 justify-between pr-3">
              <button
                className="bg-gradient-to-r from-teal-400 to-teal-500 text-white font-bold rounded-md px-4 py-2 shadow-lg hover:opacity-75 transition duration-300 ease-in-out"
                disabled={count >= product.stock}
                onClick={() => changeAmount("plus")}
              >
                +
              </button>
              <button className="m-3 bg-blue-500 h-10 rounded-md">
                <p className="w-40 text-[#fff]">{count}</p>
              </button>
              <button
                disabled={count <= 1}
                onClick={() => changeAmount("minus")}
                className="bg-gradient-to-r from-teal-400 to-teal-500 text-white font-bold px-4 py-2 shadow-lg mr-80 hover:opacity-75 transition duration-300 ease-in-out rounded-md"
              >
                -
              </button>
            </div>
            <div>
              {click ? (
                <AiFillHeart
                  size={25}
                  className="cursor-pointer"
                  onClick={() => removeFromWishlistHandler(product)}
                  color="red"
                  title="Remove from wishlist"
                />
              ) : (
                <AiOutlineHeart
                  size={25}
                  className="cursor-pointer"
                  onClick={() => addToWishlistHandler(product)}
                  color="#333"
                  title="Add to wishlist"
                />
              )}
            </div>
            <div className="flex items-center">
              <button
                className={`${styles.button} rounded-[4px] text-white w-full mt-6`}
                onClick={() => addToCartHandler(product._id)}
              >
                Add To Cart
              </button>
            </div>
          </div>
        </div>
        <div className="items-start">
          <div
            className={`${styles.button} bg-[#6443d1] mt-4 rounded h-11`}
            onClick={handleMessageSubmit}
          >
            <button className="items-start">
              <span className="text-white flex items-center w-full">
                Send Message <AiOutlineMessage className="ml-1" />
              </span>
            </button>
          </div>
        </div>
      </div>
     <div className="m-auto justify-center items-center">
     <ProductDetailsinfo product={product} />
     </div>
      {/* <Relatedproduct /> */}
    </div>
  );
};

export default Productscreen;
