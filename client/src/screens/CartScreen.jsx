import React from 'react'
import CartItem from '../component/CartItem';
import { useSelector } from 'react-redux';
import OrderSummary from '../component/OrderSummary';

const CartScreen = () => {
  const { loading, error, cartItems } = useSelector((state) => state.cart);
  return (
    <div>
     <div className="grid grid-cols-2 gap-3">
  <div>
    {cartItems.map((cartItem) => (
      <CartItem key={cartItem.id} cartItem={cartItem} />
    ))}
  </div>
  <div>
    <OrderSummary />
  </div>
</div>

    </div>
  )
}

export default CartScreen