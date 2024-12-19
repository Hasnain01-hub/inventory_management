const mongoose = require("mongoose");
const expensesSchema = new mongoose.Schema(
  {
    expense_id: {
      type: String,
      required: true,
    },
    expense_description: {
      type: String,
      required: true,
    },
    expense_amount: {
      type: Number,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    expense_date: {
      type: Date,
      required: true,
      validate: {
        validator: (value) => !isNaN(new Date(value).getTime()),
        message: "Invalid date format",
      },
    },
    expense_due_date: {
      type: Date,
      required: true,
      validate: {
        validator: (value) => !isNaN(new Date(value).getTime()),
        message: "Invalid date format",
      },
    },
    payment_method: {
      type: String,
      required: true,
      enum: ["CASH", "CARD", "ONLINE"],
    },
    status: {
      type: String,
      required: true,
      enum: ["PAID", "UNPAID"],
    },
    vendor_name: {
      type: String,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      enum: ["CZK", "USD", "EUR"],
    },
    recurring: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true } // createdAt, updatedAt timestamps will be taken care of by this automatically
);

module.exports = mongoose.model("expense", expensesSchema);
