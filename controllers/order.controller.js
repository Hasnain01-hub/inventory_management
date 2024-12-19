const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Order = require("../modal/order.modal"); // Adjust the path as necessary

// Upload files
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir); // Directory to save files
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Add a timestamp to the file name
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

// Create Order
exports.createOrder = async (req, res) => {
  upload.single("attach_files")(req, res, async (err) => {
    if (err) {
      return res
        .status(400)
        .json({ message: "File upload error", success: false });
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
