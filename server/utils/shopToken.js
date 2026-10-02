const cookieOptions = require("./cookieOptions");

const sendShopToken = (seller, statusCode, res) => {
  const token = seller.generateJWT();

  res.status(statusCode).cookie("seller_token", token, cookieOptions()).json({
    success: true,
    user: seller,
  });
};

module.exports = sendShopToken;
