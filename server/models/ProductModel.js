const  mongoose =  require ("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    subtitle: {
        type: String,
        required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    descriptoion: {
        type: String,
        required: true,
    },
    category: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    images: {
      type: [String], 
      required: true,
      default: [],
    },
    ratings: {
      type: Number,
      required: true,
      default: 0,
    },
    reviews: [
      {
        user: {
          type: Object,
        },
        rating: {
          type: Number,
        },
        comment: {
          type: String,
        },
        productId: {
          type: String,
        },
        createdAt:{
          type: Date,
          default: Date.now(),
        }
      },
    ],
    stock: {
        type: Number,
        required: true,
    },
    productIsNew: {
        type: Boolean,
        required: true,
    },
    stripeId: {
        type: String
    }
  },
  { timestamps: true }
);


const Product = mongoose.model("Product", productSchema);

module.exports = Product;