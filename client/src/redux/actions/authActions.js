import axios from "axios";

import {
  setError,
  setLoading,
  userLogin,
  upadteUserAddressSuccess,
  upadteUserAddressFailed,
  logoutSuccess,
} from "../slices/auth";

import { server } from "../../server";

export const login = (email, password) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const config = { headers: { "Content-Type": "application/json" } };

    const { data } = await axios.post(
      `${server}/login-user`,
      {
        email,
        password,
      },
      { withCredentials: true },
      config
    );

    dispatch(userLogin(data));
    localStorage.setItem("userInfo", JSON.stringify(data));
  } catch (error) {
    dispatch(
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
          ? error.message
          : "An expected error has occured. Please try again later."
      )
    );
  }
};

export const signup =
  (first_name, last_name, email, password) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      const config = { headers: { "Content-Type": "application/json" } };

      const { data } = await axios.post(
        "api/users/signup",
        { first_name, last_name, email, password },
        config
      );

      dispatch(userLogin(data));
      localStorage.setItem("userInfo", JSON.stringify(data));
    } catch (error) {
      dispatch(
        setError(
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message
            ? error.message
            : "An expected error has occured. Please try again later."
        )
      );
    }
  };

export const loadUser = () => async (dispatch) => {
  try {
    dispatch({
      type: "LoadUserRequest",
    });
    const { data } = await axios.get(`${server}/getuser`, {
      withCredentials: true,
    });
    dispatch({
      type: "LoadUserSuccess",
      payload: data.user,
    });
  } catch (error) {
    dispatch({
      type: "LoadUserFailed",
      payload: error.response.data.message,
    });
  }
};

export const loadSeller = () => async (dispatch) => {
  try {
    dispatch({
      type: "LoadSellerRequest",
    });
    const { data } = await axios.get(`${server}/getuser`, {
      withCredentials: true,
    });
    dispatch({
      type: "LoadSellerSuccess",
      payload: data.user,
    });
  } catch (error) {
    dispatch({
      type: "LoadSellerFailed",
      payload: error.response.data.message,
    });
  }
};

export const logout = () => async (dispatch) => {
  try {
    dispatch({
      type: "LogoutUserRequest",
    });
    const { data } = await axios.get(`${server}/logout`, {
      withCredentials: true,
    });
    dispatch({
      type: "LogoutUserSuccess",
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: "LogoutUserFailed",
      payload: error.response.data.message,
    });
  }
};

// user update informatiom

export const updateuserinformation =
  (name, email, password, phonenumber) => async (dispatch, action) => {
    try {
      dispatch({
        type: "updateuserinfoRequest",
      });

      const { data } = await axios.put(
        `${server}/update-user`,
        {
          email,
          password,
          phonenumber,
          name,
        },
        {
          withCredentials: true,
        }
      );
      dispatch({
        type: "updateuserinfoSuccess",
        payload: data.user,
      });
    } catch (error) {
      dispatch({
        type: "updateuserinfoFailed",
        payload: error.response.data.message,
      });
    }
  };
// updated user adress
export const updateUserAddress =
  (country, city, address1, address2, addressType) => async (dispatch) => {
    try {
      const config = { headers: { "Content-Type": "application/json" } };
      await axios.put(
        `${server}/update-user-addresses`,
        { country, city, address1, address2, addressType },
        { withCredentials: true, headers: config.headers }
      );
      dispatch(upadteUserAddressSuccess());
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        dispatch(
          upadteUserAddressFailed(
            error.response ? error.response.data.message : "An error occurred"
          )
        );
      }
    }
  };
