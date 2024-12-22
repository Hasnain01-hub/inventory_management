const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
  {
    supplier_name: {
      type: String,
      required: true,
    },
    supplier_link: {
      type: String,
      required: true,
    },
    total_purchased: {
      type: Number,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      validate: {
        validator: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: "Invalid email format",
      },
    },
    phone: {
      type: String,
      required: true,
      validate: {
        validator: (value) => /^\+?[1-9]\d{1,14}$/.test(value),
        message: "Invalid phone number format",
      },
    },
    description: {
      type: String,
      required: true,
    },
    purchase_history: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Products" },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Supplier", supplierSchema);
