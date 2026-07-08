const express = require("express");
const ErrorHandler = require("../utils/Errorhandler");
const Catachasyncerror = require("../middlewares/Catachasyncerror");
const router = express.Router();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

router.post("/payment/process", ErrorHandler, async (req, res, next) => {
  const myPayment = await stripe.paymentIntents.create({
    amount: req.body.amount,
    currency: "inr",
    metadata: {
      company: "Becodemy",
    },
  });
  res.status(201).json({
    success: true,
    clientSecret: myPayment.client_secret

})
}
);

router.get("/stripeApiKey",Catachasyncerror(async (req, res, next) => {
    res.status(200).json({
        stripeapikey: process.env.STRIPE_API_KEY
    });
}));



module.exports = router;