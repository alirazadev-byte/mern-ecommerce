import { createSlice } from "@reduxjs/toolkit";

export const initialState = {
  loading: false,
  error: null,
  products: [],
  review: [],
  product: {},
  pagination: {},
  favoritesToggled: false,
  favorites: JSON.parse(localStorage.getItem("favorites")) ?? [],
};

export const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setLoading: (state) => {
      state.loading = true;
    },
    setProducts: (state, { payload }) => {
      state.loading = false;
      state.error = null;
      state.products = payload;
    },
    setError: (state, { payload }) => {
      state.loading = false;
      state.error = payload;
    },
    setPagination: (state, { payload }) => {
      state.loading = false;
      state.error = null;
      state.pagination = payload;
    },
    setFavorites: (state, { payload }) => {
			state.favorites = payload;
		},
    setFavoritesToggle: (state, { payload }) => {
      state.favoritesToggled = payload;
    },
    setSingleProduct: (state, { payload }) => {
      state.loading = false;
      state.product = payload;
      state.error = null;
    },
    setReview: (state, { payload }) => {
      state.loading = false;
      state.review = payload;
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setProducts,
  setSingleProduct,
  setError,
  setReview,
  setPagination,
  setFavorites,
  setFavoritesToggle,
} = productSlice.actions;

export default productSlice.reducer;

export const productSelector = (state) => state.products;
