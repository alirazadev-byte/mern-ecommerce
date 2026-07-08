import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { server } from "../server";
import {toast} from "react-hot-toast"


const Activationpage = () => {
  const { activation_token } = useParams(); 
  const [error, setError] = useState(false);
  const navigate = useNavigate()

  useEffect(() => { 
    if (activation_token) {
      const activationEmail = async() => {
        try {
          const res = await axios.post(`${server}/activation` , {
            activation_token
          })
         if (res) {
          navigate("/login")
         }
          console.log(res.data.message)
        } catch (error) {
          if (error.response && error.response.data && error.response.data.error) {
            toast.error(error.response.data.message)
          }
          
        }
      }
      activationEmail()
    }
  }, [activation_token]);
  
  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {error ? (
        <p>Your Token Is Expired</p> 
      ) : (
        <p>Account Has Been Created Sucssfully</p>
      
      )}
    </div>
  );
};

export default Activationpage;
