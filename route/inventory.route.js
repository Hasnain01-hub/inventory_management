const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventory.controller");

router.get("/fetch-all-inventory", inventoryController.fetchAllInventory);
router.post("/create-inventory", inventoryController.createInventory);

module.exports = router;
