const express = require("express");
const router = express.Router();
const {
  loginAdmin,
  createAdmin,
  deleteUser,
  editAdmin,
} = require("../controllers/auth.controller");
const { verifyUser } = require("../middleware/auth.middleware");

router.post("/login-admin", loginAdmin);
router.post("/create-admin", verifyUser, createAdmin);
router.post("/edit-admin", verifyUser, editAdmin);
router.post("/delete-admin", verifyUser, deleteUser);

module.exports = router;
