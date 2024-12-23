const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customer.controller");
const { verifyUser } = require("../middleware/auth.middleware");

router.get(
  "/fetch-all-customer",
  verifyUser,
  customerController.fetchAllCustomer
);
router.post("/create-customer", verifyUser, customerController.createCustomer);
router.post("/edit-customer/:id", verifyUser, customerController.editCustomer);
router.delete(
  "/delete-customer/:id",
  verifyUser,
  customerController.deleteCustomer
);
router.post(
  "/import-customers",
  verifyUser,
  customerController.importCustomersFromCSV
);

module.exports = router;
