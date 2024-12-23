const express = require("express");
const router = express.Router();
const purchaseController = require("../controllers/purchase.controller");
const { verifyUser } = require("../middleware/auth.middleware");

router.get(
  "/fetch-all-purchase",
  verifyUser,
  purchaseController.fetchAllPurchase
);
router.post("/create-purchase", verifyUser, purchaseController.createPurchase);
router.post("/edit-purchase", verifyUser, purchaseController.editPurchase);
router.delete(
  "/delete-purchase",
  verifyUser,
  purchaseController.deletePurchase
);

module.exports = router;
