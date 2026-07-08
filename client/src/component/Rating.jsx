import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../redux/actions/productActions";
import product from "../redux/slices/product";
import { MdOutlineStarBorder } from "react-icons/md";
import { MdOutlineStar } from "react-icons/md";

const Rating = ({ product }) => {
  const dispatch = useDispatch();
  const { loading, products, error, pagination, favoritesToggled } =
    useSelector((state) => state.product);
  useEffect(() => {
    dispatch(fetchProducts(1));
  }, [dispatch]);
  return (
    <>
      <div className="flex flex-wrap gap-2">
        {product.rating === 0 ? (
          <>
            <MdOutlineStarBorder size={30} className="text-gray-400" />
            <MdOutlineStarBorder size={30} className="text-gray-400" />
            <MdOutlineStarBorder size={30} className="text-gray-400" />
            <MdOutlineStarBorder size={30} className="text-gray-400" />
            <MdOutlineStarBorder size={30} className="text-gray-400" />
          </>
        ) : product.rating === 5 ? (
          <>
            <MdOutlineStar size={30} className="text-yellow-600" />
            <MdOutlineStar size={30} className="text-yellow-600" />
            <MdOutlineStar size={30} className="text-yellow-600" />
            <MdOutlineStar size={30} className="text-yellow-600" />
            <MdOutlineStar size={30} className="text-yellow-600" />
          </>
        ) : product.rating < 1.5 && product.rating >= 1 ? (
          <>
            <MdOutlineStar size={30} className="text-yellow-600" />
            <MdOutlineStarBorder size={30} className="text-gray-400" />
            <MdOutlineStarBorder size={30} className="text-gray-400" />
            <MdOutlineStarBorder size={30} className="text-gray-400" />
            <MdOutlineStarBorder size={30} className="text-gray-400" />
          </>
        ) : product.rating > 1.5 && product.rating <= 2 ? (
          <>
            <MdOutlineStar size={30} className="text-yellow-600" />
            <MdOutlineStar size={30} className="text-yellow-600" />
            <MdOutlineStarBorder size={30} className="text-gray-400" />
            <MdOutlineStarBorder size={30} className="text-gray-400" />
            <MdOutlineStarBorder size={30} className="text-gray-400" />
          </>
        ) : 
        product.rating > 2 && product.rating < 2.5 ? (
            <>
              <MdOutlineStar size={30} className="text-yellow-600" />
              <MdOutlineStar size={30} className="text-yellow-600" />
              <MdOutlineStarBorder size={30} className="text-gray-400" />
              <MdOutlineStarBorder size={30} className="text-gray-400" />
              <MdOutlineStarBorder size={30} className="text-gray-400" />
            </>
          ) :0
        }
      </div>
    </>
  );
};

export default Rating;
