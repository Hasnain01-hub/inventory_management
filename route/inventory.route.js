const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventory.controller");
const { verifyUser } = require("../middleware/auth.middleware");

router.get(
  "/fetch-all-inventory",
  verifyUser,
  inventoryController.fetchAllInventory
);
router.post(
  "/create-inventory",
  verifyUser,
  inventoryController.createInventory
);
router.post("/edit-inventory", verifyUser, inventoryController.editInventory);
router.delete(
  "/delete-inventory/:id",
  verifyUser,
  inventoryController.deleteInventory
);
router.post(
  "/filter-inventory",
  verifyUser,
  inventoryController.filterInventory
);
router.post(
  "/import-inventory",
  verifyUser,
  inventoryController.importInventoryFromCSV
);

module.exports = router;
