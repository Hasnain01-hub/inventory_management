const mongoose = require("mongoose");
const customerSchema = new mongoose.Schema({
  customer_name: {
    type: String,
    required: true,
  },
  customer_id: {
    type: String,
    required: true,
  },
  facebook_profile_url: {
    type: String,
    // required: true,
  },
  date_added: {
    type: Date,
    default: Date.now,
    validate: {
      validator: (value) => !isNaN(new Date(value).getTime()),
      message: "Invalid date format",
    },
  },
  country: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("customer", customerSchema);
