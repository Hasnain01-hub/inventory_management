const mongoose = require("mongoose");

const orderInfoSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now,
      validate: {
        validator: (value) => !isNaN(new Date(value).getTime()),
        message: "Invalid date format",
      },
    },
    order_id: {
      type: String,
      default: Math.floor(Math.random() * 100000000),
    },
    currency: {
      type: String,
      enum: ["INR", "USD", "EUR"],
      required: true,
    },
    order_status: {
      type: String,
      required: true,
      enum: ["PENDING", "COMPLETED", "CANCELLED"],
    },
    select_product: {
      type: [String],
      required: true,
    },
    order_priority: {
      type: String,
      default: "MEDIUM",
      enum: ["HIGH", "MEDIUM", "LOW"],
    },
  },
  { _id: false } // This prevents creating an extra _id field for the nested schema
);

const paymentInfoSchema = new mongoose.Schema(
  {
    discount: {
      type: Number,
      required: true,
    },
    discount_type: {
      type: String,
      enum: ["good", "satisfactory"],
    },
    payment_status: {
      type: String,
      enum: ["PENDING", "COMPLETED"],
      required: true,
    },
    shipping_method: {
      type: String,
      required: true,
      enum: ["PLANE", "COMPLETED", "CANCELLED"],
    },
    shipping_cost: {
      type: Number,
      required: true,
    },
    actual_shipping_cost: {
      type: Number,
      required: true,
    },
    grand_total: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      default: 0,
      enum: [0, 18, 25],
    },
  },
  { _id: false } // This prevents creating an extra _id field for the nested schema
);

const customerInfoSchema = new mongoose.Schema(
  {
    customer_name: {
      type: String,
      required: true,
    },
    facebook_name: {
      type: String,
    },
    facebook_url: {
      type: String,
      // required: true,
    },
    address: {
      type: String,
      required: true,
    },
    full_name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    zip_code: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      //   enum: ["PENDING", "COMPLETED"],
      required: true,
    },
    tel: {
      type: Number,
      required: true,
      max: 10,
    },
    attach_files: {
      type: String,
      required: true,
    },
    note: {
      type: String,
    },
  },
  { _id: false } // This prevents creating an extra _id field for the nested schema
);
customerInfoSchema.pre("save", function (next) {
  if (!this.facebook_name) {
    this.facebook_name = this.customer_name;
  }
  next();
});
const orderSchema = new mongoose.Schema(
  {
    // _id: {
    //   type: Number,
    //   required: true,
    // },
    order_info: {
      type: orderInfoSchema,
      required: true,
    },
    customer_info: {
      type: customerInfoSchema,
      required: true,
    },
    payment_details: {
      type: paymentInfoSchema,
      required: true,
    },
  },
  { timestamps: true } // createdAt, updatedAt timestamps will be taken care of by this automatically
);

module.exports = mongoose.model("order", orderSchema);
