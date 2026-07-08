import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import styles from "../../styles/styles";
import Allorders from "./Allorders";
import Payment from "./Payment";
import Adress from "./Adress";
import {
  loadUser,
  updateuserinformation,
} from "../../redux/actions/authActions";
import { AiOutlineCamera } from "react-icons/ai";
import { server } from "../../server";
import axios from "axios";
import AddProduct from "../admin/AddProduct";
import FetchAllProducts from "../admin/FetchAllProducts";
import AllUsers from "../admin/AllUsers";

const Profilecontent = ({ active }) => {
  const { user, error } = useSelector((state) => state.user);

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phonenumber, setPhoneNumber] = useState(user?.phonenumber || "");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhoneNumber(user.phonenumber);
    }
  }, [user]);

  const handleSubmit = (e) => {
    try {
      e.preventDefault();
       const {data} = dispatch(updateuserinformation(name, email, password, phonenumber));
      if (data?.error) {
        toast.error(error.message)
      }
      else{
        toast.success("Updated Successfully ")
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.error
      ) {
        toast.error(error.response.data.error);
      }
      else{
        toast.success("Profile updated successfully");
      }
    }
  };

  const handleImage = async (e) => {
    const file = e.target.files[0];
    setAvatar(file);

    const formData = new FormData();
    formData.append("image", file);

    try {
      await axios.put(`${server}/update-avatar`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });
      window.location.reload();
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.error
      ) {
        toast.error(error.response.data.error);
      }
    }
  };

  return (
    <div className="w-full">
      {/* profile page */}
      {active === 1 && (
        <div className="w-full px-5">
          <div style={{ position: "relative", marginLeft: "40%" }}>
            <img
              src={`http://localhost:9000/${user?.avatar}`}
              className="w-[150px] h-[150px] rounded-full object-cover border-[3px] border-[#3ad132]"
              alt="User Avatar"
            />
            <div
              className="w-[30px] h-[30px] bg-[#E3E9EE] rounded-full flex items-center justify-center cursor-pointer absolute bottom-[5px] right-[5px] left-28"
              style={{ zIndex: 1 }}
            >
              <input
                type="file"
                id="image"
                className="hidden"
                onChange={handleImage}
              />
              <label htmlFor="image">
                <AiOutlineCamera />
              </label>
            </div>
          </div>

          <form onSubmit={handleSubmit} aria-required={true}>
            <div className="w-full 800px:flex block pb-5">
              <div className="w-[100%] 800px:w-[50%]">
                <label className="block pb-2">UserName:</label>
                <input
                  type="text"
                  className={`${styles.input} w-[95%]`}
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="w-[100%] 800px:w-[50%]">
                <label className="block pb-2">Email</label>
                <input
                  type="email"
                  className={`${styles.input} w-[95%]`}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full 800px:flex block pb-3">
              <div className="w-[100%] 800px:w-[50%]">
                <label className="block pb-2">Phone Number</label>
                <input
                  type="number"
                  className={`${styles.input} w-[95%]`}
                  required
                  value={phonenumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
              <div className="w-[100%] 800px:w-[50%]">
                <label className="block pb-2">Password</label>
                <input
                  type="password"
                  className={`${styles.input} w-[95%]`}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <input
                className={`w-[250px] h-[40px] border border-[#3a24db] text-center text-[#3a24db] rounded-[3px] mt-8 cursor-pointer ml-20`}
                type="submit"
                value="Update"
              />
            </div>
          </form>
        </div>
      )}
      {/* Order page */}
      {active === 2 && <AllUsers />}
      {/* Payment page */}
      {active === 6 && <Payment />}
      {/* Address page */}
      {active === 7 && <Adress />}
      {active === 9 && <AddProduct />}
      {active === 10 && <FetchAllProducts />}
    </div>
  );
};

export default Profilecontent;
