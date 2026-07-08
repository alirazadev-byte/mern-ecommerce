import {
  setLoading,
  setProducts,
  setError,
  setPagination,
  setFavorites,
  setFavoritesToggle,
  setSingleProduct,
  setReview,
} from "../slices/product";
import axios from "axios";

export const fetchProducts = (page) => async (dispatch) => {
  dispatch(setLoading());

  try {
    const { data } = await axios.get(`http://localhost:9000/api/v1/fetchProducts/${page}/${12}`);
    const { products, pagination } = data;
    dispatch(setProducts(products));
    dispatch(setPagination(pagination));
  } catch (error) {
    dispatch(
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
          ? error.message
          : 'An unexpected error has occurred. Please try again later'
      )
    );
  }
};

export const fetchAdminProducts = (page) => async (dispatch) => {
  dispatch(setLoading());

  try {
    const { data } = await axios.get(`http://localhost:9000/api/v1/fetchProducts/${page}/${6}`);
    const { products, pagination } = data;
    dispatch(setProducts(products));
    dispatch(setPagination(pagination));
  } catch (error) {
    dispatch(
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
          ? error.message
          : 'An unexpected error has occurred. Please try again later'
      )
    );
  }
};


export const fetchProductById = (productId) => async (dispatch) => {
  dispatch(setLoading(true));

  try {
    const { data } = await axios.get(
      `http://localhost:9000/api/v1/find/${productId}`
    );

    const product = data;
    console.log(product);
    dispatch(setSingleProduct(product));
    dispatch(setLoading(false));
  } catch (error) {
    const errorMessage = error.response.data.message;

    dispatch(setError(errorMessage));
  }
};

export const addToFavorites = (id) => async (dispatch, getState) => {
  const {
    product: { favorites },
  } = getState();

  const newfavorites = [...favorites, id];
  localStorage.setItem("favorites", JSON.stringify(newfavorites));
  dispatch(setFavorites(newfavorites));
};

export const removeFromFavorites = (id) => async (dispatch, getState) => {
  const {
    product: { favorites },
  } = getState();

  const newfavorites = favorites.filter((favouriteId) => favouriteId !== id);
  localStorage.setItem("favorites", JSON.stringify(newfavorites));
  dispatch(setFavorites(newfavorites));
};

export const toggleFavorites = (toggle) => async (dispatch, getState) => {
  const {
    product: { favorites, products },
  } = getState();

  if (toggle) {
    const filteredProducts = products.filter((product) =>
      favorites.includes(product._id)
    );
    dispatch(setFavoritesToggle(toggle));
    dispatch(setProducts(filteredProducts));
  } else {
    dispatch(setFavoritesToggle(false));
    dispatch(fetchProducts(1));
  }
};
