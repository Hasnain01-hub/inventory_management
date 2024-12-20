const express = require("express");
const router = express.Router();
const expensesController = require("../controllers/expenses.controller");
const { verifyUser } = require("../middleware/auth.middleware");

router.get("/fetch-all-expenses", expensesController.fetchAllExpenses);
router.post("/create-expenses", verifyUser, expensesController.createExpenses);
router.post("/edit-expenses", verifyUser, expensesController.editExpenses);
router.post("/delete-expenses", verifyUser, expensesController.deleteExpenses);

module.exports = router;
