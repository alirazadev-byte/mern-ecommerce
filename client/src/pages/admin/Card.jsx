import React, { useState , useEffect } from "react";
import { BiExpand } from "react-icons/bi";
import { IoCartOutline } from "react-icons/io5";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { MdDelete } from "react-icons/md";
import { deleteProduct } from "../../redux/actions/userAction";

const Card = ({ product, loading }) => {
    const { id } = useParams();

    const [click, setclick] = useState(false);
    const [open, setopen] = useState(false);
    const [count, setcount] = useState(1);
  
    const [cartPlusDisabled, setCartPlusDisabled] = useState(false);
    const dispatch = useDispatch();
  
   
    const handleDelete = (id) => {
      if (window.confirm('Are you sure you want to delete this user?')) {
        dispatch(deleteProduct(id));
      }
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
            <button onClick={() => handleDelete(product._id)}>
                      <MdDelete />
                    </button>
          </div>
        </div>
      </div>
    );
  };

export default Card