const express = require("express");
const {
  fetchProducts,
  fetchSingleProduct,
  productReview,
  adminInventory,
  deleteProductAsAdmin,
} = require("../controller/productController");
const Productroute = express.Router();
const { isAuthenticated, authorizeRoles } = require("../middlewares/Auth");

Productroute.get("/catalog", fetchProducts);
Productroute.get("/fetchProducts/:page/:perPage", fetchProducts);
Productroute.get("/find/:id", fetchSingleProduct);
Productroute.put("/create-new-review", productReview);
Productroute.get("/admin/inventory", isAuthenticated, authorizeRoles("admin"), adminInventory);
Productroute.delete("/product/:id", isAuthenticated, authorizeRoles("admin"), deleteProductAsAdmin);

module.exports = Productroute;
