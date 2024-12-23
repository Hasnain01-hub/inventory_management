const mongoose = require("mongoose");

const shipmentSchema = new mongoose.Schema(
  {
    date_shipped: {
      type: String,
      required: true,
    },
    shipment_id: {
      type: String,
      required: true,
    },
    shipping_method: {
      type: String,
      required: true,
    },
    shipping_carrier: {
      type: String,
      required: true,
    },
    tracking_number: {
      type: Number,
      required: true,
    },
    estimated_arrival: {
      type: Date,
      required: true,
    },
    shipment_cost: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      enum: ["CZK", "USD", "EUR"],
    },
    note: {
      type: String,
    },
    status: {
      type: String,
      enum: ["SHIPPED", "DELIVERED", "CANCELLED"],
      required: true,
    },
    order_list: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("shipments", shipmentSchema);
