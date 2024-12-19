const jwt = require("jsonwebtoken");
const adminModal = require("../modal/admin.modal");
require("dotenv").config();

exports.verifyUser = async (req, res, next) => {
  const authHeader = req.headers?.authtoken;
  console.log(authHeader);
  if (authHeader) {
    const token = authHeader;

    jwt.verify(token, process.env.JWT_SECRET, async (err, _id) => {
      if (err) {
        return res.status(403).json("Token is not valid!");
      }
      console.log("jwt", _id);
      const userData = await adminModal.findOne({
        username: _id.username,
      });

      if (!userData) {
        return res.status(404).json("User not found!");
      }
      if (userData.status === false) {
        return res.status(402).json({
          error: "Access Denied! Please contact admin to activate your account",
        });
      }

      req.admin = userData;
      next();
    });
  } else {
    return res.status(401).json("You are not authenticated!");
  }
};
