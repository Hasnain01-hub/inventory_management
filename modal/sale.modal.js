const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema(
  {
    discount_id: {
      type: String,
      required: true,
    },
    discount_name: {
      type: String,
      required: true,
    },
    discount_percentage: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["ACTIVE", "DEACTIVE"],
    },
    from_date: {
      type: Date,
      required: true,
      validate: {
        validator: (value) => !isNaN(new Date(value).getTime()),
        message: "Invalid date format",
      },
    },
    to_date: {
      type: Date,
      required: true,
      validate: {
        validator: (value) => !isNaN(new Date(value).getTime()),
        message: "Invalid date format",
      },
    },
    application_scope: {
      type: String,
      required: true,
    },
    product_name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true } // createdAt, updatedAt timestamps will be taken care of by this automatically
);

module.exports = mongoose.model("sale", saleSchema);
