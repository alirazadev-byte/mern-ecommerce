import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fetchAdminProducts, fetchProducts } from "../../redux/actions/productActions";
import {
  MdOutlineKeyboardDoubleArrowLeft,
  MdOutlineKeyboardDoubleArrowRight,
} from "react-icons/md";
import styles from "../../styles/styles";
import ProductCard from "../../layout/ProductCard";
import Card from "./Card";
import { deleteProduct } from "../../redux/actions/userAction";

const FetchAllProducts = () => {
  const dispatch = useDispatch();
  const { loading, products, error, pagination, favoritesToggled } =
    useSelector((state) => state.product);

 
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const page = parseInt(searchParams.get("page")) || 1;

  useEffect(() => {
    dispatch(fetchAdminProducts(page));
  }, [dispatch, page]);

  console.log(products);
  const paginationButtonClick = (page) => {
    setSearchParams({ page });
  };

  return (
    <div>
      {products.length >= 1 && (
        <div>
          <div className={`${styles.Secction}`}>
            <h1 className={`${styles.heading}`}>Feature Product</h1>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div key={product._id} className="w-full h-96 m-4">
                <Card product={product} loading={loading} />
              </div>
            ))}
          </div>
          {!favoritesToggled && (
            <div className="flex justify-center mt-8">
              {pagination.currentPage > 1 && (
                <button
                  onClick={() => paginationButtonClick(1)}
                  className="rounded-md bg-green-400 text-white mb-2 ml-2 h-10 w-10"
                >
                  <MdOutlineKeyboardDoubleArrowLeft size={35} />
                </button>
              )}
              {Array.from({ length: pagination.totalPages }, (_, i) => (
                <button
                  className={`rounded-md ${
                    pagination.currentPage === i + 1
                      ? "bg-cyan-400"
                      : "bg-gray-400"
                  } text-white text-2xl mb-2 ml-2 h-10 w-10`}
                  key={i}
                  onClick={() => paginationButtonClick(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              {pagination.currentPage < pagination.totalPages && (
                <button
                  className="rounded-md bg-green-400 text-white text-2xl mb-2 ml-2 h-10 w-10"
                  onClick={() => paginationButtonClick(pagination.totalPages)}
                >
                  <MdOutlineKeyboardDoubleArrowRight size={35} />
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FetchAllProducts;
