// add to cart
export const addTOCart = (data) => async(dispatch , getState) => {
	dispatch({
		type : "addTOCart",
		payload : data
	})
	localStorage.setItem("cartItems" , JSON.stringify(getState().cart.cart));
	return data;
}


// remove from cart

export const removeFromCart = (data) => async (dispatch,getState) => {
   dispatch({
	type  : "removeFromCart",
	payload : data._id ,
   });
   localStorage.setItem("cartItems" , JSON.stringify(getState().cart.cart))
   return data;
}