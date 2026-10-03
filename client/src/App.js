import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Login from "./pages/Login";
import Header from "./pages/Header.jsx";
import Home from "./component/Home";
import Productscreen from "./pages/Productscreen";
import Footer from "./footer/Footer.jsx";
import CartScreen from "./screens/CartScreen.jsx";
import Profilepage from "./pages/Profile/ProfilePage.jsx";
import Signup from "./component/UserSignup.jsx";
import Activationpage from "./pages/Activationpage.jsx";
import Shopcreate from "./pages/Shopcreate.jsx";
import Checkout from "./pages/Checkout.tsx";
import Paymentorder from "./pages/orderpages/Paymentorder.tsx";
import Protectedroute from "./pages/Routes/Protectedroute.jsx";
import ShowORNot from "./layout/Show&Not.jsx";
import Evenrt from "./pages/Evenr.jsx";
import Bestselling from "./pages/Bestselling.jsx";
import SellerActivationToken from "./pages/SellerActivationToken.jsx";
import ShopLogin from "./component/ShopLogin.jsx";
import store from "./redux/store.js";
import { loadUser } from "./redux/actions/authActions.js";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import FetchAllProducts from "./pages/admin/FetchAllProducts.jsx";
import Success from "./layout/Success.tsx";
import OrderHistory from "./pages/orderpages/OrderHistory.tsx";
import VendorOrders from "./pages/vendor/VendorOrders.tsx";

function App() {
  useEffect(() => {
    store.dispatch(loadUser());
  }, []);

  return (
    <div className="overflow-x-hidden">
      <BrowserRouter>
      <ShowORNot>
          <Header />
        </ShowORNot>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/order/success" element={<Protectedroute><Success /></Protectedroute>} />
          <Route path="/checkout" element={<Protectedroute><Checkout /></Protectedroute>} />
          <Route path="/orders" element={<Protectedroute><OrderHistory /></Protectedroute>} />
          <Route path="/vendor/orders" element={<VendorOrders />} />
          <Route path="/events" element={<Evenrt />} />
          <Route path="/product/:id" element={<Productscreen />} />
          <Route path="/admin/dashboard" element={<Protectedroute><AdminDashboard /></Protectedroute>} />
          <Route path="/profile" element={<Protectedroute><Profilepage /></Protectedroute>} />
          <Route path="/payment" element={<Protectedroute><Paymentorder /></Protectedroute>} />
          <Route path="/admin/fetch-all-products" element={<Protectedroute><FetchAllProducts /></Protectedroute>} />
          <Route path="/best-selling" element={<Bestselling />} />
          <Route path="/Shop" element={<Shopcreate />} />
          <Route path="/sign-up" element={<Signup />} />
          <Route
            path="/activation/:activation_token"
            element={<Activationpage />}
          />
          <Route
            path="/seller/activation/:activation_token"
            element={<SellerActivationToken />}
          />
          <Route path="/login" element={<Login />} />
          <Route path="/login-shop" element={<ShopLogin />} />
          <Route path="/cart" element={<CartScreen />} />
        </Routes>
        <ToastContainer
          position="bottom-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
        <ShowORNot>
          <Footer />
        </ShowORNot>
      </BrowserRouter>
    </div>
  );
}

export default App;
