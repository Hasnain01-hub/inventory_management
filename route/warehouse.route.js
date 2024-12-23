const express = require("express");
const router = express.Router();
const warehouseController = require("../controllers/warehouse.controller");
const { verifyUser } = require("../middleware/auth.middleware");

router.get(
  "/fetch-all-warehouse",
  verifyUser,
  warehouseController.fetchAllWarehouse
);
router.post(
  "/create-warehouse",
  verifyUser,
  warehouseController.createWarehouse
);
router.delete(
  "/delete-warehouse",
  verifyUser,
  warehouseController.deleteWarehouse
);

router.post("/edit-warehouse", verifyUser, warehouseController.editWarehouse);

module.exports = router;
