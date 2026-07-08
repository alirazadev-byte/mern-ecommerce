import { createReducer, createSlice } from "@reduxjs/toolkit";
export const initialState = {
  loading: false,
  error: null,
  userInfo: JSON.parse(localStorage.getItem("userInfo")) ?? null,
  serverMsg: null,
  isAuthenticated: false,
  serverStatus: null,
  user: null,
};

export const userReducer = createReducer(initialState, (builder) => {
  builder
    .addCase("LoadUserRequest", (state) => {
      state.loading = true;
    })
    .addCase("LoadUserSuccess", (state, action) => {
      state.isAuthenticated = true;
      state.loading = false;
      state.user = action.payload;
    })
    .addCase("LoadUserFailed", (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    })
    .addCase("LogoutUserRequest", (state) => {
      state.loading = true;
    })
    .addCase("LogoutUserSuccess", (state) => {
      state.isAuthenticated = false;
      state.user = null;
    })
    .addCase("LogoutUserFailed", (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    })
    // update user info
    .addCase("updateuserinfoRequest", (state) => {
      state.loading = true;
    })
    .addCase("updateuserinfoSuccess", (state, action) => {
      state.loading = false;
      state.user = action.payload;
    })
    .addCase("updateuserinfoFailed", (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
    // updates user address
    .addCase("updateuserRequest", (state) => {
      state.loading = true;
    })
    .addCase("updateuserSuccess", (state, action) => {
      state.loading = false;
      state.user = action.payload;
    })

    .addCase("updateuserFailed", (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })

    .addCase("clearErrors", (state) => {
      state.error = null;
    });
});

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoading: (state) => {
      state.loading = true;
    },
    upadteUserAddressSuccess: (state, action) => {
      state.loading = false;
      state.error = null;
      // Update user data with new addresses
      state.user = action.payload.user;
      state.user = action.payload;
    },
    upadteUserAddressFailed: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    userLogin: (state, { payload }) => {
      state.userInfo = payload;
      state.error = null;
      state.loading = false;
    },
    logoutSuccess: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.payload = null;
      localStorage.removeItem("token");
      localStorage.removeItem("userInfo");
    },
    setError: (state, { payload }) => {
      state.error = payload;
      state.loading = false;
    },
    verificationEmail: (state) => {
      state.userInfo && (state.userInfo.active = true);
      state.loading = false;
      state.error = null;
    },
    setServerResponseMsg: (state, { payload }) => {
      state.serverMsg = payload;
      state.loading = false;
    },
    setServerResponseStatus: (state, { payload }) => {
      state.serverStatus = payload;
      state.loading = false;
    },
    stateReset: (state) => {
      state.loading = false;
      state.serverMsg = null;
      state.error = null;
    },
    setUserOrders: (state, { payload }) => {
      state.error = null;
      state.orders = payload;
      state.loading = false;
    },
    // update user address
  },
});

export const {
  setUserOrders,
  setError,
  setLoading,
  setServerResponseStatus,
  setServerResponseMsg,
  userLogin,
  logoutSuccess,
  upadteUserAddressSuccess,
  upadteUserAddressFailed,
  verificationEmail,
  stateReset,
} = authSlice.actions;

export default authSlice.reducer;

export const authSelector = (state) => state.user;
