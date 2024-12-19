const express = require("express");
const router = express.Router();
const returnsController = require("../controllers/return.controller");

router.get("/fetch-all-return", returnsController.fetchAllReturn);
router.post("/create-return", returnsController.createReturn);

module.exports = router;
