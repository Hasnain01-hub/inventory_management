const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customer.controller");
const { verifyUser } = require("../middleware/auth.middleware");

router.get("/fetch-all-customer", customerController.fetchAllCustomer);
router.post("/create-customer", verifyUser, customerController.createCustomer);
router.post("/edit-customer", verifyUser, customerController.editCustomer);
router.post("/delete-customer", verifyUser, customerController.deleteCustomer);

module.exports = router;
