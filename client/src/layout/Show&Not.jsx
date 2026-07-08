import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const ShowORNot = ({children}) => {
    const location = useLocation()
    const [show, setShow] = React.useState(false)
    useEffect(() => {
        if (location.pathname === '/login' || location.pathname === "/order/success" || location.pathname === "/sign-up" || location.pathname === '/shop') {
            setShow(false)
        }
        else{
        setShow(true)
        }
        }, [location])
  return (
    <div>
        {
            show && children
        }
    </div>
  )
}

export default ShowORNot