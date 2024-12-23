const express = require("express");
const router = express.Router();
const shipmentController = require("../controllers/shipment.controller");
const { verifyUser } = require("../middleware/auth.middleware");

router.get(
  "/fetch-all-shipment",
  verifyUser,
  shipmentController.fetchAllShipments
);

router.post("/create-shipment", verifyUser, shipmentController.createShipment);

router.post("/edit-shipment/:id", verifyUser, shipmentController.editShipment);

router.get(
  "/shipment/update-status/:id",
  verifyUser,
  shipmentController.updateStatus
);

router.delete(
  "/delete-shipment/:id",
  verifyUser,
  shipmentController.deleteShipment
);

router.post(
  "/import-shipments",
  verifyUser,
  shipmentController.importShipmentsFromCSV
);

module.exports = router;
