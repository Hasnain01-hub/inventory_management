const multer = require("multer");
const path = require("path");
const Inventory = require("../modal/inventory.modal");

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

exports.fetchAllInventory = async (req, res) => {
  if (req.user) {
    await Inventory.find({}, async (err, inv) => {
      if (err) {
        console.log(err);
        return res.status(401).json({
          message: "No Inventory found",
          success: false,
        });
      }

      // Map over the inventory and construct full URLs for product_photo
      const inventoryWithUrls = inv.map((item) => {
        const productPhotoUrl = item.product_photo
          ? `http://your-vps-ip:3000/${item.product_photo}` // Prepend base URL
          : null;

        return {
          ...item.toObject(),
          product_photo: productPhotoUrl, // Update product_photo to full URL
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

exports.createInventory = async (req, res) => {
  upload.single("product_photo")(req, res, async (err) => {
    if (err) {
      return res
        .status(400)
        .json({ message: "File upload error", success: false });
    }

    if (!req.user) {
      return res.status(403).json({ message: "Unauthorized", success: false });
    }

    const product_photo = req.file ? req.file.path : null;

    try {
      const {
        product_name,
        category,
        warehouse,
        sku,
        price_czk,
        price_eur,
        supplier,
        supplier_link,
        quantity,
        import_cost_usd,
        import_cost_czk,
        import_cost_eur,
        barcode,
      } = req.body;

      // Create inventory record
      const inventory = new Inventory({
        product_name,
        category,
        warehouse,
        sku,
        price_czk,
        price_eur,
        supplier,
        supplier_link,
        quantity,
        import_cost_usd,
        import_cost_czk,
        import_cost_eur,
        product_photo,
        barcode,
      });

      // Save to database
      await inventory.save();

      return res.status(200).json({
        message: "Inventory created successfully",
        success: true,
        data: inventory,
      });
    } catch (error) {
      console.error("Error creating inventory:", error);
      return res.status(500).json({
        message: "Error creating inventory",
        success: false,
        data: null,
        error: error.message,
      });
    }
  });
};
