const express = require("express");
const router = express.Router();
const purchaseController = require("../controllers/purchase.controller");

router.get("/fetch-all-purchase", purchaseController.fetchAllPurchase);
router.post("/create-purchase", purchaseController.createPurchase);

module.exports = router;
