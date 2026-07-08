import React, { useEffect, useState } from "react";
import styles from "../styles/styles";
import { Link, useNavigate } from "react-router-dom";
import {
  AiOutlineHeart,
  AiOutlineSearch,
  AiOutlineShoppingCart,
} from "react-icons/ai";
import { IoIosArrowForward } from "react-icons/io";
import { CgProfile } from "react-icons/cg";
import { BiMenuAltLeft } from "react-icons/bi";
import Navbar from "../layout/Navbar";
import { useSelector } from "react-redux";
import { server } from "../server";
import Cart from "./Cart";
import axios from "axios";
import { toast } from "react-toastify";
import Wishlist from "./Wishlist";
import { RxCross1 } from "react-icons/rx";

const Header = ({ activeheading }) => {
  const { isAuthenticated, user } = useSelector((state) => state.user);
  const { cart } = useSelector((state) => state.cart);
  const { wishlist } = useSelector((state) => state.wishlist);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchData, setSearchData] = useState(null);
  const [active, setactive] = useState(false);
  const [dropdown, setdropdown] = useState(false);
  const [opencartitem, setopencartitem] = useState(false);
  const [openwishlist, setopenwishlist] = useState(false);
  const [open, setopen] = useState(false);
  const navigate = useNavigate();
  console.log(user);
  const dashboard = (e) => {
    e.preventDefault();
    if (user.role == "admin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/profile");
    }
  };

  useEffect(() => {
    axios
      .get(`${server}/getuser`, { withCredentials: true })
      .then((res) => {
        toast.success(res.data.message);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
  }, []);

  const handleSearchData = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    // Filter ProductData only if it's an array
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 70) {
        setactive(true);
      } else {
        setactive(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <div className={`${styles.Secction}`}>
        <div className="hidden 800px:h-[50px] 800px:my-[20px] 800px:flex items-center justify-between">
          <div>
            <Link to="/">
              <img src="" alt="" />
            </Link>
          </div>
          <div className="w-[50%] relative">
            <input
              type="text"
              placeholder="Search Product...."
              value={searchTerm}
              onChange={handleSearchData}
              className="h-[40px] w-full px-2 border-[#3957db] rounded-md border-[2px]"
            />
            <AiOutlineSearch
              size={30}
              className="absolute right-2 top-1.5 cursor-pointer"
            />
            {setSearchData && setSearchData.length !== 0 ? (
              <div className="absolute"></div>
            ) : null}
          </div>
          <div className={`${styles.button}`}>
            <Link to="/shop">
              <h1 className="text-[#fff] flex items-center text-center">
                Become A Seller{" "}
                <IoIosArrowForward className="ml-1 float-right" />
              </h1>
            </Link>
          </div>
        </div>
        <div
          className={`${
            active ? "shadow-sm fixed top-0 left-0 z-10 w-full" : ""
          } transition-all duration-300 ease-in-out hidden 800px:flex items-end justify-between bg-[#3321c8]`}
        >
          <div
            className={`${styles.Secction} ${styles.normalFlex} justify-between`}
          >
            <div className="relative h-[60px] w-[270px] mt-[10px] hidden 1000px:block">
              <BiMenuAltLeft size={30} className="absolute top-3 left-2" />
            </div>
            <div className={`${styles.normalFlex} justify-center mt-6`}>
              <Navbar active={activeheading} />
            </div>
            <div className={`${styles.normalFlex}`}>
              <div
                className="relative cursor-pointer mr-[15px]"
                onClick={() => setopenwishlist(true)}
              >
                <AiOutlineHeart size={30} color="rgb(255 256 255 / 83%)" />
                <span className="absolute right-0 top-0 rounded-full bg-[#3bc177] w-4 top right p-0 m-0 text-white font-mono text-12px ">
                  {wishlist && wishlist.length}
                </span>
              </div>
              <div
                className="relative cursor-pointer mr-[15px]"
                onClick={() => setopencartitem(true)}
              >
                <Link>
                  <AiOutlineShoppingCart
                    size={30}
                    color="rgb(255 256 255 / 83%)"
                  />
                  <span className="absolute right-0 top-0 rounded-full bg-[#3bc177] w-4 top right p-0 m-0 text-white font-mono text-12px ">
                    {cart && cart.length}
                  </span>
                </Link>
              </div>
              <div className="relative cursor-pointer mr-[15px]">
                {isAuthenticated ? (
                  <Link onClick={dashboard}>
                    <img
                      src={`http://localhost:9000/${user.avatar}`}
                      alt={user.email}
                      className="w-8 h-12 rounded-[50%] ml-5"
                    />
                  </Link>
                ) : (
                  <Link to="/login">
                    <CgProfile size={30} color="rgb(255 256 255 / 83%)" />
                  </Link>
                )}
              </div>
            </div>
            {opencartitem ? <Cart setopencartitem={setopencartitem} /> : null}
            {openwishlist ? (
              <Wishlist setopenwishlist={setopenwishlist} />
            ) : null}
          </div>
        </div>
      </div>

      <div className="w-full h-[60px] fixed bg-[#fff] z-50 top-0 left-0 shadow-sm 800px:hidden">
        <div className="w-full flex items-center justify-between">
          <div>
            <BiMenuAltLeft
              size={40}
              className="ml-4"
              onClick={() => setopen(true)}
            />
          </div>
          <div>
            <Link to="/">
              <img src="" alt="" className="mt-3 cursor-pointer" />
            </Link>
          </div>
          <div>
            <div className="relative mr-[20px]">
              <AiOutlineShoppingCart size={30} />
              <span className="absolute right-0 top-0 rounded-full bg-[#3bc177] w-4 top right p-0 m-0 text-white font-mono text-12px ">
                0
              </span>
            </div>
          </div>
        </div>
        {open && (
          <div className="fixed w-full bg-[#0000005f] z-20 top-0 left-0">
            <div className="fixed w-[60%] bg-[#fff] h-screen top-0 left-0 z-10">
              <div className="w-full justify-between flex pr-3">
                <div>
                  <div className="relative mr-[15px]">
                    <AiOutlineHeart size={30} className="mt-5 ml-3" />
                    <span className="absolute right-0 top-0 rounded-full bg-[#3bc177] w-4 top right p-0 m-0 text-white font-mono text-12px ">
                      0
                    </span>
                  </div>
                </div>
                <RxCross1
                  size={20}
                  className="ml-4 mt-5"
                  onClick={() => setopen(false)}
                />
              </div>
              <div className="my-8 w-[92%] px-2 h-[40px]">
                <input
                  type="search"
                  placeholder="Search Product...."
                  className="h-[40px] w-full px-2 border-[#3957db] border-[2px] rounded-md"
                />
              </div>
              <Navbar active={activeheading} />
              <div className={`${styles.button} ml-4 rounded-[4px]`}>
                <Link to="/shop">
                  <h1 className="text-[#fff] flex items-center text-center">
                    Become A Seller{" "}
                    <IoIosArrowForward className="ml-1 float-right" />
                  </h1>
                </Link>
              </div>
              <br />
              <br />
              <div className="flex w-full  justify-center ">
                <Link
                  to="/login"
                  className="text-[18px]pr-[10px] text-[#000000b7]"
                >
                  Login/
                </Link>
                <Link
                  to="/sign-up"
                  className="text-[18px]pr-[10px] text-[#000000b7] "
                >
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Header;
