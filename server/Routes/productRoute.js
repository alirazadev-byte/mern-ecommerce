const express = require("express") ;
const {fetchProducts, fetchSingleProduct, productReview} = require("../controller/productController");
const Product = require("../models/ProductModel.js");
const Productroute = express.Router();
const { isAuthenticated, authorizeRoles } = require("../middlewares/Auth");


Productroute.get("/fetchProducts/:page/:perPage" , fetchProducts)
Productroute.get("/find/:id" , fetchSingleProduct)
Productroute.put("/create-new-review" , productReview)

Productroute.delete("/product/:id", isAuthenticated, authorizeRoles("admin"), async (req, res) => {
    try {
      const user = await Product.findByIdAndDelete(req.params.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      res.status(200).json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  })


module.exports =   Productroute;