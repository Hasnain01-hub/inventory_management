const express = require("express");
const router = express.Router();
const supplierController = require("../controllers/suppliers.controller");
const { verifyUser } = require("../middleware/auth.middleware");

router.get(
  "/fetch-all-suppliers",
  verifyUser,
  supplierController.fetchAllSupliers
);

router.post("/create-supplier", verifyUser, supplierController.addSupplier);

router.post(
  "/edit-supplier/:id",
  verifyUser,
  supplierController.updateSupplier
);

router.delete(
  "/delete-supplier/:id",
  verifyUser,
  supplierController.deleteSupplier
);

router.post(
  "/import-suppliers",
  verifyUser,
  supplierController.importSuppliersFromCSV
);

module.exports = router;
