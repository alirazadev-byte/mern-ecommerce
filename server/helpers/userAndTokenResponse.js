const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../confing/config');

exports.userAndTokenResponse = (req, res, user) => {
  if (!user) {
    res.status(404).json({ error: "User not found" });
    console.log("User not fount!!!")
  }

  const token = jwt.sign({ id: user._id }, JWT_SECRET, {
    expiresIn: "1h",
  });
  const refreshToken = jwt.sign({ id: user._id }, JWT_SECRET, {
    expiresIn: "7d",
  });
  user.password = undefined;
  user.resetCode = undefined;

  res.status(200).json({
    token,
    refreshToken,
    user,
  });
};
