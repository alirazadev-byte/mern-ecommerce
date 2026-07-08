import { combineReducers, configureStore } from "@reduxjs/toolkit";

// import product from "./slices/product";

// import auth from './slices/auth';
import product from "./slices/product";
import { authSlice, userReducer } from "./slices/auth";
import { cartReducer  } from './slices/cart'
import { wishlistReducer } from "./slices/wishlish";
import { SellerReducer } from "./slices/seller";
import { userSlices } from "./slices/userSlices";

const store = configureStore({
    reducer : {
        user : userReducer ,
        SellerReducer:SellerReducer,
        cart : cartReducer ,
        users : userSlices,
        product : product ,
        wishlist : wishlistReducer
    }, 
});

export default store



