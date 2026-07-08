import React, { useEffect, useState } from "react";
import styles from "../styles/styles";
import axios from "axios";
import image from "../assets/Images/logo.png.png";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { RxCross2 } from "react-icons/rx";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import Rating from "./Rating";

const ProductDetailsInfo = ({ product }) => {
  const [active, setActive] = useState(1);
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(1);
  const [comment, setComment] = useState("");
  const { user } = useSelector((state) => state.user);
  const { id } = useParams();
  const [selectedItem, setSelectedItem] = useState(product);

  // const ProductReviewLength =
  // product && product.reduce((acc, product) => acc + product.reviews.length , 0)
  const reviewHandler = async () => {
    if (rating > 1 && selectedItem) {
      try {
        const response = await axios.put(
          "http://localhost:9000/api/v1/create-new-review",
          {
            user,
            rating,
            comment,
            productId: selectedItem._id, 
            orderId:id
          }
        );
        toast.success(response.data.message);
        setOpen(false);
      } catch (error) {
        console.error(error);
        toast.error("Error submitting review");
      }
    } else {
      toast.error("Please select a rating and ensure the product is selected");
    }
  };

  return (
    <div className="bg-gray-200 lg:w-full px-3 800px:px-10 py-2 rounded w-full">
      <div className="w-full flex justify-between border-b pt-10 pb-2  m-auto">
        <div className="relative">
          <h5
            className="text-[#000] text-[18px] px-1 leading-5 font-[600] cursor-pointer 800px:text-[20px] "
            onClick={() => setActive(1)}
          >
            Product Details
          </h5>
          {active === 1 && <div className={`${styles.active_indicator}`} />}
        </div>
        <div className="relative">
        {
          product.isReviewd ? (null) : (  <h5
            className="text-[#000] text-[18px] px-1 leading-5 font-[600] cursor-pointer 800px:text-[20px] "
            onClick={() => {
              setActive(2);
              setOpen(true);
            }}
          >
            Give Your Review And Rating
          </h5>)
        }
          {open && (
            <div className="w-full fixed top-0 left-0 h-screen bg-[#0005] z-50 flex justify-center items-center">
              <div className="w-[40%] h-min bg-[#fff] shadow rounded-md p-3">
                <div className="w-full flex justify-end p-3">
                  <RxCross2
                    size={30}
                    className="cursor-pointer"
                    onClick={() => setOpen(false)}
                  />
                </div>
                <h2 className="text-[30px] font-[500] font-Poppins text-center">
                  Give A Review
                </h2>
                <div className="w-full flex">
                  <img
                    src={product.images[0]}
                    alt=""
                    className="w-[80px] h-[80px]"
                  />
                  <div>
                    <div className="pl-3 text-[20px]">{product.name}</div>
                    <h4 className="pl-3 text-[20px]">{product.price}</h4>
                  </div>
                </div>
                <h5 className="pl-3 text-[20px] font-[500]">
                  Give a Rating <span className="text-red-500">*</span>
                </h5>
                <div className="flex w-full ml-2 pt-2">
                  {[1, 2, 3, 4, 5].map((i) =>
                    rating >= i ? (
                      <AiFillStar
                        key={i}
                        className="mr-1 cursor-pointer"
                        color="rgb(246,186,0)"
                        size={25}
                        onClick={() => setRating(i)}
                      />
                    ) : (
                      <AiOutlineStar
                        key={i}
                        className="mr-1 cursor-pointer"
                        color="rgb(246,186,0)"
                        size={25}
                        onClick={() => setRating(i)}
                      />
                    )
                  )}
                </div>
                <div className="w-full ml-3">
                  <label className="block text-[20px] font-[500]">
                    Write A Comment
                    <span className="ml-2 font-[400] text-[16px] text-[#0000052]">
                      (optional)
                    </span>
                  </label>
                  <textarea
                    name="comment"
                    cols="20"
                    rows="5"
                    placeholder="Give Your Comment About this Product"
                    className="mt-2 w-[95%] border p-2 outline-none"
                    onChange={(e) => setComment(e.target.value)}
                  ></textarea>
                </div>
                <div
                  className={`${styles.button} text-white text-[20px] ml-3`}
                  onClick={reviewHandler}
                >
                  Submit
                </div>
              </div>
            </div>
          )}
          {active === 2 && <div className={`${styles.active_indicator}`} />}
        </div>
        <div className="relative">
          <h5
            className="text-[#000] text-[18px] px-1 leading-5 font-[600] cursor-pointer 800px:text-[20px] "
            onClick={() => setActive(3)}
          >
            Seller Information
          </h5>
          {active === 3 && <div className={`${styles.active_indicator}`} />}
        </div>
      </div>
      {active === 1 && (
        <>
          <p className="py-2 text-[18px] leading-8 pb-10 whitespace-pre-line">
           { product.description ? product.description : product.descriptoion }
          </p>
          <p className="py-1 text-[18px] leading-8 pb-10 whitespace-pre-line">
            {product.name} -- {product.brand}
          </p>
        </>
      )}
      {active === 2 && (
        <div className="w-full  min-h-[40vh] flex flex-col items-center py-4 overflow-y-scroll ">
          {
            product && product.reviews.map((item , index) => (
              <div className="w-full flex my-2 ">
                <img src={`http://localhost:9000/${item.user.avatar}`} className="w-[50px] h-[50px] rounded-full " alt="" />
                <div className="pl-2">
                 <div className="w-full flex items-center">
                 <h1 className=" font-[500] mr-3 ">{item.user.name}</h1>
                  <Rating rating={product?.ratings}  />
                 </div>
                  <p>{item.comment} </p> 

                </div>
              </div>
            ))
          }
          <div className="w-full flex justify-center">
          {
            product && product.reviews.length === 0 && (
              <h5>No Reviews have for this product</h5>
            )
          }
          </div>
        </div>
      )}
      {active === 3 && (
        <div className="w-full block 800px:flex p-5">
          <div className="w-full 800px:w-[50%]">
            <div className="flex items-center">
              <img
                src={image}
                alt="Daraz.pk"
                className="h-20 w-20 rounded-full "
              />
            </div>
            <div>
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto
                asperiores ullam minima molestias recusandae! Sint, molestias.
                Placeat quo iste earum quibusdam aliquam, quidem blanditiis
                praesentium? Optio ratione omnis repellat ipsam!
              </p>
            </div>
          </div>
          <div className="w-full 800px:w-[50%] mt-5 800px:mt-0 800px:flex flex-col items-end">
            <div className="text-left">
              <h5 className="font-[600]">
                Joined on <span className="font-[500]">23 March 2024</span>
              </h5>
              <h5 className="font-[600] pt-3">
                Total Product: <span className="font-[500]">100</span>
              </h5>
              <h5 className="font-[600] pt-4">
                Total Reviews: <span className="font-[500]">200</span>
              </h5>
              <Link to="/">
                <div className={`${styles.button} rounded-4px`}>
                  <h4 className="text-white">Visit Shop</h4>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailsInfo;
