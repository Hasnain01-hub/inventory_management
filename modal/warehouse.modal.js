const mongoose = require("mongoose");

const warehouseSchema = new mongoose.Schema(
  {
    warehouse_name: {
      type: String,
      required: true,
    },
    location: {
      type: String,
    },
    status: {
      type: String,
      required: true,
    },
    contact: {
      type: Number,
      required: true,
      max: 10,
    },
    rented_from_date: {
      type: Date,
      required: true,
    },
    expense_id: {
      type: String,
      //   required: true,
    },
    Notes: {
      type: String,
    },
    attachments: {
      type: String,
    },
    warehouse_photo: {
      type: String,
    },
  },
  { timestamps: true } // createdAt, updatedAt timestamps will be taken care of by this automatically
);

module.exports = mongoose.model("warehouse", warehouseSchema);
