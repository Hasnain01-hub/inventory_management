const express = require("express");
const router = express.Router();
const saleController = require("../controllers/sale.controller");
const { verifyUser } = require("../middleware/auth.middleware");

router.get("/fetch-all-sale", verifyUser, saleController.fetchAllSale);
router.post("/create-sale", verifyUser, saleController.createSale);
router.post("/edit-sale", verifyUser, saleController.editSale);
router.delete("/delete-sale", verifyUser, saleController.deleteSale);

module.exports = router;
