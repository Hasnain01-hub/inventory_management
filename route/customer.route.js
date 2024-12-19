const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customer.controller");

router.get("/fetch-all-customer", customerController.fetchAllCustomer);
router.post("/create-customer", customerController.createCustomer);

module.exports = router;
