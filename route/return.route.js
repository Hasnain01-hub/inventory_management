const express = require("express");
const router = express.Router();
const returnsController = require("../controllers/return.controller");
const { verifyUser } = require("../middleware/auth.middleware");

router.get("/fetch-all-return", verifyUser, returnsController.fetchAllReturn);
router.post("/create-return", verifyUser, returnsController.createReturn);
router.post("/edit-return", verifyUser, returnsController.editReturn);
router.delete("/delete-return", verifyUser, returnsController.deleteReturn);

module.exports = router;
