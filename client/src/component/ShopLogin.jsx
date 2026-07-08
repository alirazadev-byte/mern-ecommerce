import axios from "axios";
import React, { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";


import { useDispatch, useSelector } from "react-redux";
import { toast } from 'react-toastify';
import server from "../confing/server";
import styles from "../styles/styles";


const ShopLogin = () => {
  const navigate = useNavigate();
 const {isAuthenticated} = useSelector((state) => state.user)
//  useEffect(()=> {
//   if(isAuthenticated === true){
//     navigate("/")
//   }
//  })
  const dispatch = useDispatch();
  const [email, setemail] = useState();
  const [password, setpassword] = useState();
  const [visible, setvisible] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault()
    axios.post(`${server}/login-shop` , {
      email ,
      password
    } , {withCredentials : true}).then((res) => {
      toast.success("Login Successfully!!")
      window.location.reload(true)
    }).catch((error) => {
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error)
      }
    })
  }
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-12 lg:px-8">
      {" "}
      <div className=" sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className=" text-center text-3xl font-extrabold text-gray-900">
          Login to your Shop
        </h2>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6"  onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Adress
              </label>
              <div className="mt-1">
                <input
                  type="email"  
                  name="email"
                  autoComplete="emial"
                  required
                  value={email}
                  onChange={(e) => setemail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm-text-sm"
                />{" "}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={visible ? "text" : "password"}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm-text-sm"
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
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
            </div>
            <div className={`${styles.normalFlex} justify-between`}>
              <div className={`${styles.normalFlex}`}>
                {" "}
                <input
                  type="checkbox"
                  name="remember me"
                  id="remember me"
                  className="w-4 h-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember me"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Remember Me
                </label>
              </div>
              <Link
                to={".forgot-password"}
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
              <h4>Not Have An Account?</h4>
              <Link to="/sign-up" className="text-blue-500 pl-2">
                Sign Up
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ShopLogin;
