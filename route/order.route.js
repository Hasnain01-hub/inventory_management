const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const { verifyUser } = require("../middleware/auth.middleware");

router.get("/fetch-all-order", orderController.fetchAllOrder);
router.post("/create-order", verifyUser, orderController.createOrder);
router.post("/edit-order", verifyUser, orderController.editOrder);
router.post("/delete-order", verifyUser, orderController.deleteOrder);

module.exports = router;
