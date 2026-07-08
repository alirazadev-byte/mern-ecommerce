import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from "react-hot-toast";
import { useAuth } from "../../context/auth";

const AccountAccount = () => {
  const [auth, setAuth] = useAuth();
  const { resetCode } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (resetCode) {
      requestForAccess();
    }
  }, [resetCode]);

  const requestForAccess = async () => {
    try {
      const { data } = await axios.get(`http://localhost:8000/api/v1/auth/access-account/${resetCode}`);
      if (data?.error) {
        toast.error(data.error);
      } else {
        localStorage.setItem("auth", JSON.stringify(data));
        setAuth(data);
        toast.success("Please update your password in Profile page");
        navigate("/");
      }
    } catch (err) {
      console.log(err);
      toast.error("Password Request failed…Try again");
    }
  }

  return (
    <div className="account-activate">
      <div className="title"> Please wait... </div>
      <br /><br />
      <div className="loading-bar">Loading</div>
    </div>
  )
}

export default AccountAccount;
