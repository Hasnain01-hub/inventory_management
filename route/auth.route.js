const express = require("express");
const router = express.Router();
const { loginAdmin, createAdmin } = require("../controllers/auth.controller");
const { verifyUser } = require("../middleware/auth.middleware");

router.post("/login-admin", loginAdmin);
router.post("/create-admin", verifyUser, createAdmin);

module.exports = router;
