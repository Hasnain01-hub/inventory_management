const express = require("express");
const router = express.Router();
const warehouseController = require("../controllers/warehouse.controller");

router.get("/fetch-all-warehouse", warehouseController.fetchAllWarehouse);
router.post("/create-warehouse", warehouseController.createWarehouse);

module.exports = router;
