import React from 'react'
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const OrderSummary = () => {
    const { subtotal, shipping } = useSelector((state) => state.cart);
  return (
    <div className='min-w-[100px] border-spacing-8 border-gray-[1px] rounded-lg p-8 w-full mt-10'>
        <h2 className="text-3xl font-bold text-center">Order Summary</h2>
        <div className='flex justify-between'>
            <b>Subtotal: </b>
            <span>{subtotal}$</span>
        </div>
        
        <div>
        <b>Shipping: </b>
        <span className='ml-[590px]'>{subtotal === 0 ?0:shipping}$</span>
        <hr />
        </div>
        <div className='mt-6 flex justify-end items-center'>
            <div className='font-semibold mr-4'>Total:</div>
            <div>{subtotal + shipping}</div>
        </div>
        <div>
            <Link to={'/check'} >
            <button className='bg-cyan-400 rounded-md p-4'>
                CheckOut
            </button>
            </Link>
        </div>
    </div>
  )
}

export default OrderSummary