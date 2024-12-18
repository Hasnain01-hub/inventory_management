const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema(
  {
    item_name: {
      type: String,
      required: true,
    },
    sku: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    shipment_id: {
      type: String,
      required: true,
    },
    import_price: {
      type: Number,
      required: true,
    },
    import_currency: {
      type: String,
      required: true,
      enum: ["CZK", "USD", "EUR"],
    },
    //supplier
    supplier_name: {
      type: String,
      required: true,
    },
    supplier_url: {
      type: String,
      required: true,
    },
    status: {
      type: String,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true } // createdAt, updatedAt timestamps will be taken care of by this automatically
);

module.exports = mongoose.model("purchase", purchaseSchema);
