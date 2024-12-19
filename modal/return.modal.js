const mongoose = require("mongoose");
const items_returnedSchema = new mongoose.Schema({
  item_name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  sku: {
    type: String,
    required: true,
  },
});
const returnsSchema = new mongoose.Schema({
  return_id: {
    type: String,
    required: true,
  },
  customer_name: {
    type: String,
    required: true,
  },
  order_number: {
    type: String,
    required: true,
  },
  return_date: {
    type: Date,
    validate: {
      validator: (value) => !isNaN(new Date(value).getTime()),
      message: "Invalid date format",
    },
    required: true,
  },
  return_type: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  note: {
    type: String,
    required: true,
  },
  items_returned: {
    type: [items_returnedSchema],
    required: true,
  },
});

module.exports = mongoose.model("return", returnsSchema);
