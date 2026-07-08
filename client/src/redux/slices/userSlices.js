// userReducer.js

const initialStates = {
  users: [],
  products: [],
  loading: false,
  error: null,
};

export const userSlices = (state = initialStates, action) => {
  switch (action.type) {
    case "USERS_REQUEST":
      return {
        ...state,
        loading: true,
      };
    case "USERS_SUCCESS":
      return {
        ...state,
        users: action.payload.users,
        loading: false,
        error: null,
      };
    case "USERS_FAILURE":
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case "DELETE_USER_REQUEST":
      return {
        ...state,
        loading: true,
      };
    case "DELETE_USER_SUCCESS":
      return {
        ...state,
        users: state.users.filter((user) => user._id !== action.payload),
        loading: false,
        error: null,
      };
    case "DELETE_USER_FAILURE":
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
      case "DELETE_PRODUCT_REQUEST":
      return {
        ...state,
        loading: true,
      };
    case "DELETE_PRODUCT_SUCCESS":
      return {
        ...state,
        products: state.products.filter((user) => user._id !== action.payload),
        loading: false,
        error: null,
      };
    case "DELETE_PRODUCT_FAILURE":
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
};
