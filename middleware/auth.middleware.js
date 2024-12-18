const jwt = require("jsonwebtoken");
const User = require("../model/user.model");
require("dotenv").config();

exports.verifyuser = async (req, res, next) => {
  const authHeader = req.headers?.authtoken;

  if (authHeader) {
    const token = authHeader;

    jwt.verify(token, process.env.JWT_SECRET, async (err, _id) => {
      if (err) {
        return res.status(403).json("Token is not valid!");
      }
      console.log("jwt", _id);
      const userData = await User.findOne({ email: _id.data.email });

      if (!userData) {
        return res.status(404).json("User not found!");
      }
      if (userData.status === false) {
        return res.status(402).json({
          error: "Access Denied! Please contact admin to activate your account",
        });
      }

      req.user = userData;
      next();
    });
  } else {
    return res.status(401).json("You are not authenticated!");
  }
};
