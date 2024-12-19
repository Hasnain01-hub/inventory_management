const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");

router.get("/fetch-all-order", orderController.fetchAllOrder);
router.post("/create-order", orderController.createOrder);

module.exports = router;
