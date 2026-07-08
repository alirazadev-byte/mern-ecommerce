import React, { useEffect, useState } from "react";
import axios from "axios";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";

import styles from "../styles/styles";
import server from "../confing/server";
import { toast } from "react-toastify";
import { RxAvatar } from "react-icons/rx";

const Shopcreate = () => {
  const navigate = useNavigate();

  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [visible, setvisible] = useState(false);
  const [name, setname] = useState("");
  const [phonenumber, setphonenumber] = useState("");
  const [address, setaddress] = useState("");
  const [zipcode, setzipcode] = useState("");
  const [avatar, setavatar] = useState(null);

  const handleFileInputChange = (e) => {
    setavatar(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const config = { headers: { "Content-Type": "multipart/form-data" } };
    const formData = new FormData();
    formData.append("file", avatar);
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("zipCode", zipcode);
    formData.append("phonenumber", phonenumber);
    formData.append("address", address);
    try {
      const res = await axios.post(
        "http://localhost:9000/api/v2/create-shop",
        formData,
        config
      );
      if (res.data.success === true) {
        navigate("/login");
      }
      toast.success(res.data.message);
      setname("");
      setemail("");
      setpassword("");
      setavatar(null);
      setzipcode("");
      setaddress("");
      setphonenumber("");
    } catch (err) {
      toast.error(err.response.data.error);
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Register as a seller
        </h2>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[35rem]">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Shop Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="name"
                  required
                  value={name}
                  onChange={(e) => setname(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="phonenumber"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Shop Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="phonenumber"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Phone Number"
                  value={phonenumber}
                  onChange={(e) => setphonenumber(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <div className="mt-1 mb-2">
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setemail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={visible ? "text" : "password"}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setpassword(e.target.value)}
                />
                {visible ? (
                  <AiOutlineEye
                    className="absolute right-2 top-2 cursor-pointer"
                    size={25}
                    onClick={() => setvisible(false)}
                  />
                ) : (
                  <AiOutlineEyeInvisible
                    className="absolute right-2 top-2 cursor-pointer"
                    size={25}
                    onClick={() => setvisible(true)}
                  />
                )}
              </div>
            </div>
            <div className="mt-2 flex items-center">
              <span className="inline-block h-8 w-8 rounded-full overflow-hidden">
                {avatar ? (
                  <img
                    src={URL.createObjectURL(avatar)}
                    alt="avatar"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <RxAvatar className="h-8 w-8" />
                )}
              </span>
              <label
                htmlFor="file-input"
                className="ml-5 flex items-center justify-center px-4 py-2 border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <span>Upload A File</span>
                <input
                  type="file"
                  name="avatar"
                  id="file-input"
                  className="sr-only"
                  accept=".jpg,.jpeg,.png"
                  onChange={handleFileInputChange}
                />
              </label>
            </div>
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700"
              >
                Address
              </label>
              <div className="mt-1 mb-2">
                <input
                  type="text"
                  name="address"
                  required
                  value={address}
                  onChange={(e) => setaddress(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="zipcode"
                className="block text-sm font-medium text-gray-700"
              >
                Zip Code
              </label>
              <div className="mt-1 mb-2">
                <input
                  type="text"
                  name="zipcode"
                  required
                  value={zipcode}
                  onChange={(e) => setzipcode(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            <div className={`${styles.normalFlex} justify-between`}>
              <div className={`${styles.normalFlex}`}>
                <input
                  type="checkbox"
                  name="rememberMe"
                  id="rememberMe"
                  className="w-4 h-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="rememberMe"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Remember Me
                </label>
              </div>
              <Link
                to="/forgot-password"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Forgot your password?
              </Link>
            </div>
            <div>
              <button
                type="submit"
                className="group relative w-full h-[40px] justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Submit
              </button>
            </div>
            <div className={`${styles.normalFlex} w-full`}>
              <h4>Already Have An Account?</h4>
              <Link to="/login" className="text-blue-500 pl-2">
                Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Shopcreate;
