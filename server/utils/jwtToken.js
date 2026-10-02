const cookieOptions = require("./cookieOptions");

const sendToken = (user, statusCode, res) => {
  const token = user.generateJWT();

  res.status(statusCode).cookie("token", token, cookieOptions()).json({
    success: true,
    user,
  });
};

module.exports = sendToken;
