const expensesModal = require("../modal/expenses.modal");

exports.fetchAllExpenses = async (req, res) => {
  if (req.user) {
    await expensesModal.find({}, async (err, expenses) => {
      if (err) {
        console.log(err);
        return res.status(401).json({
          message: "No Expenses found",
          success: false,
        });
      }

      if (expenses.length > 0) {
        return res.status(200).json({
          data: expenses,
          success: true,
        });
      } else {
        return res.status(200).json({
          data: [],
          success: true,
        });
      }
    });
  } else {
    res.status(401).json({
      message: "Admin not found!",
      success: false,
    });
  }
};

exports.createExpenses = async (req, res) => {
  try {
    const {
      expense_id,
      expense_description,
      expense_amount,
      country,
      expense_date,
      expense_due_date,
      payment_method,
      status,
      vendor_name,
      currency,
      recurring,
    } = req.body;

    // Create warehouse record
    const expenses = new expensesModal({
      expense_id,
      expense_description,
      expense_amount,
      country,
      expense_date,
      expense_due_date,
      payment_method,
      status,
      vendor_name,
      currency,
      recurring,
    });

    // Save to database
    await expenses.save();

    return res.status(200).json({
      message: "Expenses created successfully",
      success: true,
      data: expenses,
    });
  } catch (error) {
    console.error("Error creating expenses:", error);
    return res.status(500).json({
      message: "Error creating expenses",
      success: false,
      data: null,
      error: error.message,
    });
  }
};
