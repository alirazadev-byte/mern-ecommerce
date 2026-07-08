import React from 'react'
import { useDispatch } from 'react-redux';
import { RxCross1 } from "react-icons/rx";
// import { addCartItem, removeCartItem } from '../redux/actions/cartactions';

const CartItem = ({ cartItem }) => {
    const { name, image, price, stock, qty, id, brand } = cartItem;
	const dispatch = useDispatch();
  return (
    <div className='w-[14rem] h-[16rem] bg-slate-200 mt-10 rounded-md ml-[17rem]'>
  <div className="w-5 h-4 bg-slate-500">
    
    {/* <RxCross1 onClick={() => dispatch(removeCartItem(id))} cursor={'pointer'} /> */}
  </div>
  <div>
    <div className="flex mx-auto">
      <b>Brand:</b>
      <div className='ml-3'>{brand}</div>
    </div>
    <br />
    <b>Price:</b> {price}
  </div>
  <div>
    {/* Image */}
    <img src={image} width={'60px'} alt="brand" />
  </div>
  <div>
    {/* Select input for quantity */}
    <select
      value={qty}
      // onChange={(e) => {
      //   dispatch(addCartItem(id, e.target.value));
      // }}
    >
      {[...Array(stock).keys()].map((item) => (
        <option key={item + 1} value={item + 1}>
          {item + 1}
        </option>
      ))}
    </select>
  </div>
</div>

    
  )
}

export default CartItem