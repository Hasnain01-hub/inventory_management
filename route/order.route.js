const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const { verifyUser } = require("../middleware/auth.middleware");

router.get("/fetch-all-order", verifyUser, orderController.fetchAllOrder);
router.post("/create-order", verifyUser, orderController.createOrder);
router.post("/edit-order/:id", verifyUser, orderController.editOrder);
router.delete("/delete-order/:id", verifyUser, orderController.deleteOrder);

module.exports = router;
