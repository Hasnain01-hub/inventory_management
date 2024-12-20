const express = require("express");
const router = express.Router();
const purchaseController = require("../controllers/purchase.controller");
const { verifyUser } = require("../middleware/auth.middleware");

router.get("/fetch-all-purchase", purchaseController.fetchAllPurchase);
router.post("/create-purchase", verifyUser, purchaseController.createPurchase);
router.post("/edit-purchase", verifyUser, purchaseController.editPurchase);
router.post("/delete-purchase", verifyUser, purchaseController.deletePurchase);

module.exports = router;
