const Order = require("../models/order");
const Product = require("../models/ProductModel");

exports.fetchProducts = async (req, res) => {
  const page = parseInt(req.params.page);
  const perPage = parseInt(req.params.perPage);

  const products = await Product.find({});

  if (page && perPage) {
    const totalPages = Math.ceil(products.length / perPage);
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedProducts = products.slice(startIndex, endIndex);
    res.json({
      products: paginatedProducts,
      pagination: {
        currentPage: page,
        totalPages,
      },
    });
  } else {
    res.json({
      products,
      pagination: {},
    });
  }
};
/* fetach product by id */
exports.fetchSingleProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).send("Product Is Not Found");
  }
};

exports.productReview = async (req, res) => {
  try {
    const { user, rating, comment, productId, orderId } = req.body;
    if ( !rating || !comment ) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      console.log("proudct not found")
      return res.status(404).json({ message: "Product not found" });
    }

    const existingReviewIndex = product.reviews.findIndex(
      (rev) => rev.user.toString() === user._id.toString()
    );

    if (existingReviewIndex !== -1) {
      // Update existing review
      product.reviews[existingReviewIndex].rating = rating;
      product.reviews[existingReviewIndex].comment = comment;
    } else {
      // Add new review
      product.reviews.push({ user, rating, comment });
    }

    // Calculate average rating
    product.ratings =
      product.reviews.reduce((acc, review) => acc + review.rating, 0) /
      product.reviews.length;

    await product.save({ validateBeforeSave: false });
    await Order.findByIdAndUpdate;

    return res.status(201).json({ message: "Review added successfully" });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
