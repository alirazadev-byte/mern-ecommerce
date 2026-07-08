import React, { Children, useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const Protectedroute = ({children}) => {
    const { isAuthenticated, user } = useSelector((state) => state.user);
    const navigate = useNavigate()
    const [loading , setLoading] = useState(true)
    useEffect(() => {
        const checkAuthenticated = async() => {
            await new Promise((resolve) => setTimeout(resolve , 500))
            setLoading(false)
        }
        checkAuthenticated()
    } , [])
    if (loading) return <div className="loading"></div>

    if (!user) {
        navigate("/login")
    }
    return  children
  
}

export default Protectedroute