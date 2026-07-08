import React, { useState } from "react";
import styles from "../../styles/styles";
import { AiOutlineDelete } from "react-icons/ai";
import axios from "axios";
import server from "../../confing/server";
import { toast } from "react-toastify";

const Payment = () => {
  const [oldpassword, setoldpassword] = useState("");
  const [newpassword, setnewpassword] = useState("");
  const [confirmpassword, setconfirmpassword] = useState("");
  const passwordchangehandler = async (e) => {
    e.preventDefault();

    if(oldpassword === "" || newpassword === "" || confirmpassword === ""){
      toast.error("Please fill all the fields");
    }

   axios.put(
      `${server}/update-password`,
      {oldpassword,
      newpassword,
      confirmpassword},
      { withCredentials: true }
    ).then((res) => {
      toast.success("Password Updated Successfully")
    }).catch((error) => {
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error)
      }
    })
  };
  return (
    <div className="w-full px-5">
      <h1 className="block text-center text-[25px] font-[600] text-[#000000ba] pb-2">
        Change Password
      </h1>
      <form
        onSubmit={passwordchangehandler}
        className="flex flex-col items-center   "
      >
        <div className="w-[100%] 800px:w-[50%] mt-2">
          <label className="block pb-2">Enter Your old Password</label>
          <input
            type="password"
            className={`${styles.input} !w-[95%] mb-2 800px:mb-0`}
          
            value={oldpassword}
            onChange={(e) => setoldpassword(e.target.value)}
          />
        </div>
        <div className="w-[100%] 800px:w-[50%] mt-1">
          <label className="block pb-2">Enter Your New Password</label>
          <input
            type="password"
            className={`${styles.input} !w-[95%] mb-2 800px:mb-0`}
          
            value={newpassword}
            onChange={(e) => setnewpassword(e.target.value)}
          />
        </div>
        <div className="w-[100%] 800px:w-[50%] mt-1">
          <label className="block pb-2">Enter Your Confirm Password</label>
          <input
            type="password"
            className={`${styles.input} !w-[95%] mb-2 800px:mb-0`}
          
            value={confirmpassword}
            onChange={(e) => setconfirmpassword(e.target.value)}
          />
          <input
            type="submit"
            value="Update"
            required
            className={` w-full h-[40px] border border-[#3a24db] mt-3`}
          />
        </div>
      </form>
    </div>
  );
};

export default Payment;
