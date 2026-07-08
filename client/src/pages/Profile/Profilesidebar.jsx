import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { RxPerson } from "react-icons/rx";
import { GiShoppingBag } from "react-icons/gi";
import { HiOutlineReceiptRefund } from "react-icons/hi";
import { CiInboxIn } from "react-icons/ci";
import { MdTrackChanges } from "react-icons/md";
import { MdCreditCard } from "react-icons/md";
import { FaAddressBook } from "react-icons/fa";
import { IoMdLogOut } from "react-icons/io";
import { toast } from "react-toastify";
import { MdWifiPassword } from "react-icons/md";
import axios from "axios";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/actions/authActions";

const Profilesidebar = ({ active, setactive }) => {
  const navigate = useNavigate();
  const history = useLocation();
  const dispatch = useDispatch();

  const handleLogout = (e) => {
    try {
      dispatch(logout());
      alert("logout succesfully");
      navigate("/");
      window.location.reload();
    } catch (error) {
      console.log(error.message);
    }
  };
  return (
    <div className="w-full bg-white shadow-sm rounded-[10px] p-4 pt-8 mt-4">
      <div
        className="flex items-center cursor-pointer w-full mb-8"
        onClick={() => setactive(1)}
      >
        <RxPerson size={20} color={active === 1 ? "red" : ""} />
        <span
          className={`pl-3 ${
            active === 1 ? "text-red-600" : ""
          } 800px:block hidden`}
        >
          Profile
        </span>
      </div>
      <div
        className="flex items-center cursor-pointer w-full mb-8"
        onClick={() => setactive(2)}
      >
        <GiShoppingBag size={20} color={active === 2 ? "red" : ""} />
        <span
          className={`pl-3 ${
            active === 2 ? "text-red-600" : ""
          } 800px:block hidden`}
        >
          Orders
        </span>
      </div>
      <div
        className="flex items-center cursor-pointer w-full mb-8"
        onClick={() => setactive(3)}
      >
        <HiOutlineReceiptRefund size={20} color={active === 3 ? "red" : ""} />
        <span
          className={`pl-3 ${
            active === 3 ? "text-red-600" : ""
          } 800px:block hidden`}
        >
          Refund
        </span>
      </div>
      <div
        className="flex items-center cursor-pointer w-full mb-8"
        onClick={() => setactive(4) || navigate("/inbox")}
      >
        <CiInboxIn size={20} color={active === 4 ? "red" : ""} />
        <span
          className={`pl-3 ${
            active === 4 ? "text-red-600" : ""
          } 800px:block hidden`}
        >
          Inbox
        </span>
      </div>
      <div
        className="flex items-center cursor-pointer w-full mb-8"
        onClick={() => setactive(5)}
      >
        <MdTrackChanges size={20} color={active === 5 ? "red" : ""} />
        <span
          className={`pl-3 ${
            active === 5 ? "text-red-600" : ""
          } 800px:block hidden`}
        >
          Track Order
        </span>
      </div>
      <div
        className="flex items-center cursor-pointer w-full mb-8"
        onClick={() => setactive(6)}
      >
        <MdWifiPassword size={20} color={active === 6 ? "red" : ""} />
        <span
          className={`pl-3 ${
            active === 6 ? "text-red-600" : ""
          } 800px:block hidden `}
        >
          Change Pasword
        </span>
      </div>
      <div
        className="flex items-center cursor-pointer w-full mb-8"
        onClick={() => setactive(7)}
      >
        <FaAddressBook size={20} color={active === 7 ? "red" : ""} />
        <span
          className={`pl-3 ${
            active === 7 ? "text-red-600" : ""
          } 800px:block hidden`}
        >
          Adress
        </span>
      </div>

      <button
        className="flex items-center cursor-pointer w-full mb-8"
        onClick={() => {
          setactive(8) || handleLogout();
        }}
      >
        <IoMdLogOut size={20} color={active === 8 ? "red" : ""} />
        <Link
          to="#"
          onClick={handleLogout}
          className={`pl-3 ${
            active === 8 ? "text-red-600" : ""
          } 800px:block hidden`}
        >
          Log Out
        </Link>
      </button>
    </div>
  );
};

export default Profilesidebar;
