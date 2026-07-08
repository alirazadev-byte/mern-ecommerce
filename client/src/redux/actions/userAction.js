import axios from "axios";

export const fetchUsers = () => async (dispatch) => {
  try {
    dispatch({ type: "USERS_REQUEST" });
    const { data } = await axios.get('http://localhost:9000/api/v2/all-users-record');
    dispatch({
      type: "USERS_SUCCESS",
      payload: data,
    });
  } catch (error) {
    dispatch({ type: "USERS_FAILURE", payload: error.response?.data?.message || error.message });
  }
};

export const deleteUser = (id) => async (dispatch) => {
  try {
    dispatch({ type: "DELETE_USER_REQUEST" });
    await axios.delete(`http://localhost:9000/api/v2/user/${id}`);
    dispatch({
      type: "DELETE_USER_SUCCESS",
      payload: id,
    });
  } catch (error) {
    dispatch({ type: "DELETE_USER_FAILURE", payload: error.response?.data?.message || error.message });
  }
};

export const deleteProduct = (id) => async (dispatch) => {
  try {
    dispatch({ type: "DELETE_PRODUCT_REQUEST" });
    await axios.delete(`http://localhost:9000/api/v1/product/${id}`);
    dispatch({
      type: "DELETE_PRODUCT_SUCCESS",
      payload: id,
    });
  } catch (error) {
    dispatch({ type: "DELETE_PRODUCT_FAILURE", payload: error.response?.data?.message || error.message });
  }
};