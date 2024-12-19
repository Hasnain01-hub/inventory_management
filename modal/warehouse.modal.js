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
      validate: {
        validator: (value) => !isNaN(new Date(value).getTime()),
        message: "Invalid date format",
      },
    },
    expense_id: {
      type: String,
      //   required: true,
    },
    notes: {
      type: String,
    },
    attachments: {
      type: [String],
      description:
        "Path or URL to the attachment file related to the warehouse item",
    },
    warehouse_photo: {
      type: String,
      description:
        "Path or URL to the attachment file related to the warehouse",
    },
  },
  { timestamps: true } // createdAt, updatedAt timestamps will be taken care of by this automatically
);

module.exports = mongoose.model("warehouse", warehouseSchema);
