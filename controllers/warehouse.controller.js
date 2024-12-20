const multer = require("multer");
const path = require("path");
const Warehouse = require("../modal/warehouse.modal");
const fs = require("fs");
//Upload files
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

exports.fetchAllWarehouse = async (req, res) => {
  if (req.admin) {
    await Warehouse.find({}, async (err, warehouse) => {
      if (err) {
        console.log(err);
        return res.status(401).json({
          message: "No Inventory found",
          success: false,
        });
      }

      // Map over the inventory and construct full URLs for product_photo
      const inventoryWithUrls = warehouse.map((item) => {
        const productPhotoUrl = item.warehouse_photo
          ? `http://your-vps-ip:3000/${item.product_photo}` // Prepend base URL
          : null;
        const attachmentUrls = item.attachments
          ?.map((attachment) =>
            attachment ? `http://your-vps-ip:3000/${attachment}` : null
          )
          .filter(Boolean); // Filter out null values in case of invalid paths

        return {
          ...item.toObject(),
          warehouse_photo: productPhotoUrl, // Update product_photo to full URL
          attachments: attachmentUrls,
        };
      });

      if (inventoryWithUrls.length > 0) {
        return res.status(200).json({
          data: inventoryWithUrls,
          success: true,
        });
      } else {
        return res.status(200).json({
          data: [],
          success: true,
        });
      }
    });
  } else {
    res.status(401).json({
      message: "Admin not found!",
      success: false,
    });
  }
};

// Create Warehouse
exports.createWarehouse = async (req, res) => {
  // Use `fields` for multiple file uploads
  upload.fields([
    { name: "warehouse_photo", maxCount: 1 },
    { name: "attachments", maxCount: 10 }, // Adjust maxCount as needed
  ])(req, res, async (err) => {
    if (err) {
      return res
        .status(400)
        .json({ message: "File upload error", success: false });
    }

    if (req.admin.type !== "ADMIN" && req.admin.type !== "SUPER_ADMIN") {
      return res.status(401).json({
        message: "You are not authorized to delete order",
        success: false,
      });
    }
    // Retrieve uploaded files
    const warehouse_photo = req.files?.warehouse_photo
      ? req.files.warehouse_photo[0].path
      : null;

    const attachments = req.files?.attachments
      ? req.files.attachments.map((file) => file.path)
      : [];

    try {
      const {
        warehouse_name,
        location,
        status,
        contact,
        rented_from_date,
        expense_id,
        notes,
      } = req.body;

      // Create warehouse record
      const warehouse = new Warehouse({
        warehouse_name,
        location,
        status,
        contact,
        rented_from_date,
        expense_id,
        notes,
        attachments,
        warehouse_photo,
      });

      // Save to database
      await warehouse.save();

      return res.status(200).json({
        message: "Warehouse created successfully",
        success: true,
        data: warehouse,
      });
    } catch (error) {
      console.error("Error creating warehouse:", error);
      return res.status(500).json({
        message: "Error creating warehouse",
        success: false,
        data: null,
        error: error.message,
      });
    }
  });
};

// Edit Warehouse
exports.editWarehouse = async (req, res) => {
  // Use `fields` for multiple file uploads
  upload.fields([
    { name: "warehouse_photo", maxCount: 1 },
    { name: "attachments", maxCount: 10 },
  ])(req, res, async (err) => {
    if (err) {
      return res
        .status(400)
        .json({ message: "File upload error", success: false });
    }

    if (req.admin.type !== "ADMIN" && req.admin.type !== "SUPER_ADMIN") {
      return res.status(401).json({
        message: "You are not authorized to delete order",
        success: false,
      });
    }
    // Retrieve uploaded files (if any)
    const warehouse_photo = req.files?.warehouse_photo
      ? req.files.warehouse_photo[0].path
      : null;

    const attachments = req.files?.attachments
      ? req.files.attachments.map((file) => file.path)
      : [];

    try {
      const {
        warehouse_name,
        location,
        status,
        contact,
        rented_from_date,
        expense_id,
        notes,
      } = req.body;

      // Find the warehouse to update
      const warehouse = await Warehouse.findById(req.params.id);
      if (!warehouse) {
        return res
          .status(404)
          .json({ message: "Warehouse not found", success: false });
      }

      // Update the warehouse fields
      warehouse.warehouse_name = warehouse_name || warehouse.warehouse_name;
      warehouse.location = location || warehouse.location;
      warehouse.status = status || warehouse.status;
      warehouse.contact = contact || warehouse.contact;
      warehouse.rented_from_date =
        rented_from_date || warehouse.rented_from_date;
      warehouse.expense_id = expense_id || warehouse.expense_id;
      warehouse.notes = notes || warehouse.notes;
      warehouse.attachments = attachments.length
        ? attachments
        : warehouse.attachments;
      warehouse.warehouse_photo = warehouse_photo || warehouse.warehouse_photo;

      // Save the updated warehouse
      await warehouse.save();

      return res.status(200).json({
        message: "Warehouse updated successfully",
        success: true,
        data: warehouse,
      });
    } catch (error) {
      console.error("Error updating warehouse:", error);
      return res.status(500).json({
        message: "Error updating warehouse",
        success: false,
        error: error.message,
      });
    }
  });
};

// Delete Warehouse
exports.deleteWarehouse = async (req, res) => {
  if (req.admin.type !== "ADMIN" && req.admin.type !== "SUPER_ADMIN") {
    return res.status(401).json({
      message: "You are not authorized to delete order",
      success: false,
    });
  }

  try {
    // Find the warehouse to delete
    const warehouse = await Warehouse.findByIdAndDelete(req.params.id);
    if (!warehouse) {
      return res
        .status(404)
        .json({ message: "Warehouse not found", success: false });
    }

    return res.status(200).json({
      message: "Warehouse deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error deleting warehouse:", error);
    return res.status(500).json({
      message: "Error deleting warehouse",
      success: false,
      error: error.message,
    });
  }
};
