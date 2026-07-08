import { createReducer, createSlice } from "@reduxjs/toolkit";
export const initialState = {
  isAuthenticated: false,
};

export const SellerReducer = createReducer(initialState, (builder) => {
  builder
    .addCase("LoadSellerRequest", (state) => {
      state.loading = true;
    })
    .addCase("LoadSellerSuccess", (state, action) => {
      state.isAuthenticated = true;
      state.loading = false;
      state.Seller = action.payload;
    })
    .addCase("LoadSellerFailed", (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    })

    // update Seller info
    .addCase("updateSellerinfoRequest", (state) => {
      state.loading = true;
    })
    .addCase("updateSellerinfoSuccess", (state, action) => {
      state.loading = false;
      state.Seller = action.payload;
    })
    .addCase("updateSellerinfoFailed", (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
    // updates Seller address
    .addCase("updateSellerRequest", (state) => {
      state.loading = true;
    })
    .addCase("updateSellerSuccess", (state, action) => {
      state.loading = false;
      state.Seller = action.payload;
    })

    .addCase("updateSellerFailed", (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })

    .addCase("clearErrors", (state) => {
      state.error = null;
    });
});
