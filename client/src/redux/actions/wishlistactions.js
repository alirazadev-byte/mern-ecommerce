// add to wish list
export const addTOwishlist = (data) => async(dispatch , getState) => {
	dispatch({
		type : "addtowishlist",
		payload : data
	})
	localStorage.setItem("wishlistItems" , JSON.stringify(getState().wishlist.wishlist));
	return data;
}


// remove from wish list

export const removeFromwishlist = (data) => async (dispatch,getState) => {
   dispatch({
	type  : "removeFromwishlist",
	payload : data._id ,
   });
   localStorage.setItem("wishlistItems" , JSON.stringify(getState().wishlist.wishlist))
   return data;
}