const express = require("express");
const router = express.Router();
const saleController = require("../controllers/sale.controller");

router.get("/fetch-all-sale", saleController.fetchAllSale);
router.post("/create-sale", saleController.createSale);

module.exports = router;
