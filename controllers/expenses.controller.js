const expensesModal = require("../modal/expenses.modal");
const { csv_upload } = require("../helpers/fileUpload");
const fs = require("fs");
const csvParser = require("csv-parser");

exports.fetchAllExpenses = async (req, res) => {
  if (req.admin) {
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

//Create Expenses
exports.createExpenses = async (req, res) => {
  try {
    if (req.admin.type !== "ADMIN" && req.admin.type !== "SUPER_ADMIN") {
      return res.status(401).json({
        message: "You are not authorized to delete order",
        success: false,
      });
    }
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

//Edit Expenses
exports.editExpenses = async (req, res) => {
  try {
    if (req.admin.type !== "ADMIN" && req.admin.type !== "SUPER_ADMIN") {
      return res.status(401).json({
        message: "You are not authorized to edit expenses",
        success: false,
      });
    }

    const {
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

    // Find the expense record to update
    const expenses = await expensesModal.findById(req.params.id);
    if (!expenses) {
      return res
        .status(404)
        .json({ message: "Expense not found", success: false });
    }

    // Update the expense fields
    expenses.expense_description =
      expense_description || expenses.expense_description;
    expenses.expense_amount = expense_amount || expenses.expense_amount;
    expenses.country = country || expenses.country;
    expenses.expense_date = expense_date || expenses.expense_date;
    expenses.expense_due_date = expense_due_date || expenses.expense_due_date;
    expenses.payment_method = payment_method || expenses.payment_method;
    expenses.status = status || expenses.status;
    expenses.vendor_name = vendor_name || expenses.vendor_name;
    expenses.currency = currency || expenses.currency;
    expenses.recurring = recurring || expenses.recurring;

    // Save the updated expense record
    await expenses.save();

    return res.status(200).json({
      message: "Expense updated successfully",
      success: true,
      data: expenses,
    });
  } catch (error) {
    console.error("Error updating expense:", error);
    return res.status(500).json({
      message: "Error updating expense",
      success: false,
      error: error.message,
    });
  }
};

//Delete Expenses
exports.deleteExpenses = async (req, res) => {
  try {
    if (req.admin.type !== "ADMIN" && req.admin.type !== "SUPER_ADMIN") {
      return res.status(401).json({
        message: "You are not authorized to delete expenses",
        success: false,
      });
    }

    // Find the expense record to delete
    const expenses = await expensesModal.findByIdAndDelete(req.params.id);
    if (!expenses) {
      return res
        .status(404)
        .json({ message: "Expense not found", success: false });
    }

    return res.status(200).json({
      message: "Expense deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error deleting expense:", error);
    return res.status(500).json({
      message: "Error deleting expense",
      success: false,
      error: error.message,
    });
  }
};

exports.importExpensesFromCSV = async (req, res) => {
  csv_upload.single("csv_file")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        message: "File upload error",
        success: false,
        error: err.message,
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded. Please upload a CSV file.",
        success: false,
      });
    }

    const filePath = req.file.path;

    try {
      const expenses = [];

      // Read and parse the CSV file
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on("data", (row) => {
          // Map CSV row to the expenses schema
          const expense = {
            expense_id: row.expense_id,
            expense_description: row.expense_description,
            expense_amount: parseFloat(row.expense_amount),
            country: row.country,
            expense_date: new Date(row.expense_date),
            expense_due_date: new Date(row.expense_due_date),
            payment_method: row.payment_method,
            status: row.status,
            vendor_name: row.vendor_name,
            currency: row.currency,
            recurring: row.recurring === "true", // Convert to boolean
          };
          expenses.push(expense);
        })
        .on("end", async () => {
          try {
            // Validate and save expenses to the database
            await expensesModal.insertMany(expenses);

            res.status(201).json({
              message: "Expenses imported successfully",
              success: true,
              data: expenses,
            });
          } catch (dbError) {
            console.error("Error saving expenses to database:", dbError);
            res.status(500).json({
              message: "Error saving expenses to database",
              success: false,
              error: dbError.message,
            });
          } finally {
            // Clean up: Delete the temporary CSV file
            fs.unlinkSync(filePath);
          }
        });
    } catch (error) {
      console.error("Error processing CSV file:", error);
      res.status(500).json({
        message: "Error processing CSV file",
        success: false,
        error: error.message,
      });

      // Clean up: Delete the temporary CSV file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  });
};
