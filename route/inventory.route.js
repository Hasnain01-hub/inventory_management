const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventory.controller");
const { verifyUser } = require("../middleware/auth.middleware");

router.get("/fetch-all-inventory", inventoryController.fetchAllInventory);
router.post(
  "/create-inventory",
  verifyUser,
  inventoryController.createInventory
);
router.post("/edit-inventory", verifyUser, inventoryController.editInventory);
router.post(
  "/delete-inventory",
  verifyUser,
  inventoryController.deleteInventory
);
router.post("/filter-inventory", inventoryController.filterInventory);
router.post("/import-inventory", inventoryController.importInventoryFromCSV);

module.exports = router;
