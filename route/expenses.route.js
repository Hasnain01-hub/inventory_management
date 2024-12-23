const express = require("express");
const router = express.Router();
const expensesController = require("../controllers/expenses.controller");
const { verifyUser } = require("../middleware/auth.middleware");

router.get(
  "/fetch-all-expenses",
  verifyUser,
  expensesController.fetchAllExpenses
);
router.post("/create-expenses", verifyUser, expensesController.createExpenses);
router.post("/edit-expenses/:id", verifyUser, expensesController.editExpenses);
router.delete(
  "/delete-expenses/:id",
  verifyUser,
  expensesController.deleteExpenses
);
router.post(
  "/import-expenses",
  verifyUser,
  expensesController.importExpensesFromCSV
);

module.exports = router;
