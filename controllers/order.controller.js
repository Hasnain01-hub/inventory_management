const fs = require("fs");
const Order = require("../modal/order.modal"); // Adjust the path as necessary
const { upload, csv_upload } = require("../helpers/fileUpload");

// Create Order
exports.createOrder = async (req, res) => {
  upload.single("attach_files")(req, res, async (err) => {
    if (err) {
      return res
        .status(400)
        .json({ message: "File upload error", success: false });
    }
    if (req.admin.type !== "ADMIN" && req.admin.type !== "SUPER_ADMIN") {
      return res.status(401).json({
        message: "You are not authorized to create order",
        success: false,
      });
    }

    try {
      const { order_info, customer_info, payment_details } = req.body;

      // Include uploaded file path in customer_info
      const attach_files = req.file ? req.file.path : null;

      const newOrder = new Order({
        order_info: JSON.parse(order_info),
        customer_info: { ...JSON.parse(customer_info), attach_files },
        payment_details: JSON.parse(payment_details),
      });

      await newOrder.save();

      return res.status(201).json({
        message: "Order created successfully",
        success: true,
        data: newOrder,
      });
    } catch (error) {
      console.error("Error creating order:", error);
      return res.status(500).json({
        message: "Error creating order",
        success: false,
        error: error.message,
      });
    }
  });
};

// Edit Order
exports.editOrder = async (req, res) => {
  upload.single("attach_files")(req, res, async (err) => {
    if (err) {
      return res
        .status(400)
        .json({ message: "File upload error", success: false });
    }
    if (req.admin.type !== "ADMIN" && req.admin.type !== "SUPER_ADMIN") {
      return res.status(401).json({
        message: "You are not authorized to edit order",
        success: false,
      });
    }

    try {
      const { order_id, order_info, customer_info, payment_details } = req.body;

      const order = await Order.findById(order_id);
      if (!order) {
        return res.status(404).json({
          message: "Order not found",
          success: false,
        });
      }

      // Update order details
      if (order_info) {
        order.order_info = JSON.parse(order_info);
      }

      if (customer_info) {
        const updatedCustomerInfo = { ...JSON.parse(customer_info) };
        if (req.file) {
          updatedCustomerInfo.attach_files = req.file.path;
        }
        order.customer_info = updatedCustomerInfo;
      }

      if (payment_details) {
        order.payment_details = JSON.parse(payment_details);
      }

      await order.save();

      return res.status(200).json({
        message: "Order updated successfully",
        success: true,
        data: order,
      });
    } catch (error) {
      console.error("Error editing order:", error);
      return res.status(500).json({
        message: "Error editing order",
        success: false,
        error: error.message,
      });
    }
  });
};

// Delete Order
exports.deleteOrder = async (req, res) => {
  if (req.admin.type !== "ADMIN" && req.admin.type !== "SUPER_ADMIN") {
    return res.status(401).json({
      message: "You are not authorized to delete order",
      success: false,
    });
  }

  try {
    const { order_id } = req.body;

    const order = await Order.findById(order_id);
    if (!order) {
      return res.status(404).json({
        message: "Order not found",
        success: false,
      });
    }

    await Order.findByIdAndDelete(order_id);

    return res.status(200).json({
      message: "Order deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error deleting order:", error);
    return res.status(500).json({
      message: "Error deleting order",
      success: false,
      error: error.message,
    });
  }
};

// Fetch Orders
exports.fetchAllOrder = async (req, res) => {
  try {
    const orders = await Order.find(); // Add filters or sorting as needed

    return res.status(200).json({
      message: "Orders fetched successfully",
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({
      message: "Error fetching orders",
      success: false,
      error: error.message,
    });
  }
};
