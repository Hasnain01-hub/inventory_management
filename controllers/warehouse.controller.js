const multer = require("multer");
const path = require("path");
const Warehouse = require("../modal/warehouse.modal");
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
  if (req.user) {
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

    if (!req.user) {
      return res.status(403).json({ message: "Unauthorized", success: false });
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
