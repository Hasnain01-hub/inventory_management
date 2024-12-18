const mongoose = require("mongoose");
const inventorySchema = new mongoose.Schema(
  {
    product_name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
    },
    warehouse: {
      type: String,
      required: true,
    },
    sku: {
      type: String,
      required: true,
    },
    price_czk: {
      type: Number,
      required: true,
    },
    price_eur: {
      type: Number,
      required: true,
    },
    supplier: {
      type: String,
      required: true,
    },
    supplier_link: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    import_cost_usd: {
      type: Number,
    },
    import_cost_czk: {
      type: Number,
    },
    import_cost_eur: {
      type: Number,
    },
    product_photo: {
      type: String,
    },
    barcode: {
      type: String,
    },
  },
  { timestamps: true } // createdAt, updatedAt timestamps will be taken care of by this automatically
);

module.exports = mongoose.model("inventory", inventorySchema);
