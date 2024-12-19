const express = require("express");
const router = express.Router();
const expensesController = require("../controllers/expenses.controller");

router.get("/fetch-all-expenses", expensesController.fetchAllExpenses);
router.post("/create-expenses", expensesController.createExpenses);

module.exports = router;
