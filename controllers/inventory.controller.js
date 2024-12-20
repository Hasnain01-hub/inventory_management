const multer = require("multer");
const path = require("path");
const Inventory = require("../modal/inventory.modal");
const fs = require("fs");

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir); // Directory to save files
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Add a timestamp to the file name
  },
});

// File filter for specific MIME types
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit to 5MB
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
  if (req.admin) {
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

// Create Inventory
exports.createInventory = async (req, res) => {
  upload.single("product_photo")(req, res, async (err) => {
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

    const product_photo = req.file ? req.file.path : null;
    console.log("File uploaded:", product_photo);
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
      console.log(product_photo, "product_photo");

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

// Delete Inventory
exports.deleteInventory = async (req, res) => {
  try {
    if (req.admin.type !== "ADMIN" && req.admin.type !== "SUPER_ADMIN") {
      return res.status(401).json({
        message: "You are not authorized to delete order",
        success: false,
      });
    }
    const { inventory_id } = req.body;

    // Find and delete the inventory record by ID
    const inventory = await Inventory.findByIdAndDelete(inventory_id);
    if (!inventory) {
      return res.status(404).json({
        message: "Inventory not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Inventory deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error deleting inventory:", error);
    return res.status(500).json({
      message: "Error deleting inventory",
      success: false,
      error: error.message,
    });
  }
};

// Edit Inventory
exports.editInventory = async (req, res) => {
  if (req.admin.type !== "ADMIN" && req.admin.type !== "SUPER_ADMIN") {
    return res.status(401).json({
      message: "You are not authorized to delete order",
      success: false,
    });
  }
  upload.single("product_photo")(req, res, async (err) => {
    if (err) {
      return res
        .status(400)
        .json({ message: "File upload error", success: false });
    }

    try {
      const { inventory_id, ...updateFields } = req.body;

      // Find the inventory record by ID
      const inventory = await Inventory.findById(inventory_id);
      if (!inventory) {
        return res.status(404).json({
          message: "Inventory not found",
          success: false,
        });
      }

      // Update product photo if a new file is uploaded
      if (req.file) {
        updateFields.product_photo = req.file.path;
      }

      // Update other fields
      for (const [key, value] of Object.entries(updateFields)) {
        inventory[key] = value;
      }

      // Save updated inventory to database
      await inventory.save();

      return res.status(200).json({
        message: "Inventory updated successfully",
        success: true,
        data: inventory,
      });
    } catch (error) {
      console.error("Error updating inventory:", error);
      return res.status(500).json({
        message: "Error updating inventory",
        success: false,
        error: error.message,
      });
    }
  });
};

// Filter Inventory
exports.filterInventory = async (req, res) => {
  try {
    const {
      product_name,
      category,
      warehouse,
      supplier,
      price_min,
      price_max,
      quantity_min,
      quantity_max,
    } = req.query;

    // Build the filter object dynamically
    const filters = {};

    if (product_name) {
      filters.product_name = { $regex: product_name, $options: "i" }; // Case-insensitive match
    }

    if (category) {
      filters.category = category;
    }

    if (warehouse) {
      filters.warehouse = warehouse;
    }

    if (supplier) {
      filters.supplier = supplier;
    }

    if (price_min || price_max) {
      filters.price_czk = {};
      if (price_min) filters.price_czk.$gte = Number(price_min); // Greater than or equal to
      if (price_max) filters.price_czk.$lte = Number(price_max); // Less than or equal to
    }

    if (quantity_min || quantity_max) {
      filters.quantity = {};
      if (quantity_min) filters.quantity.$gte = Number(quantity_min); // Greater than or equal to
      if (quantity_max) filters.quantity.$lte = Number(quantity_max); // Less than or equal to
    }

    // Query the database with the filters
    const inventoryItems = await Inventory.find(filters);

    if (!inventoryItems.length) {
      return res.status(404).json({
        message: "No inventory items match the specified criteria",
        success: false,
        data: [],
      });
    }

    return res.status(200).json({
      message: "Inventory items fetched successfully",
      success: true,
      data: inventoryItems,
    });
  } catch (error) {
    console.error("Error filtering inventory:", error);
    return res.status(500).json({
      message: "Error filtering inventory",
      success: false,
      error: error.message,
    });
  }
};

const csv_upload = multer({
  dest: "uploads/", // Temporary folder for uploaded files
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/csv") {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed"));
    }
  },
});
// Import Inventory from CSV
exports.importInventoryFromCSV = async (req, res) => {
  csv_upload.single("csv_file")(req, res, async (err) => {
    if (err) {
      return res
        .status(400)
        .json({ message: "File upload error", success: false });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded. Please upload a CSV file.",
        success: false,
      });
    }

    const filePath = req.file.path;

    try {
      const inventoryItems = [];

      // Read and parse the CSV file
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on("data", (row) => {
          // Ensure each row contains valid data matching the schema
          const item = {
            product_name: row.product_name,
            category: row.category || null,
            warehouse: row.warehouse,
            sku: row.sku,
            price_czk: parseFloat(row.price_czk),
            price_eur: parseFloat(row.price_eur),
            supplier: row.supplier,
            supplier_link: row.supplier_link,
            quantity: parseInt(row.quantity, 10),
            import_cost_usd: parseFloat(row.import_cost_usd) || null,
            import_cost_czk: parseFloat(row.import_cost_czk) || null,
            import_cost_eur: parseFloat(row.import_cost_eur) || null,
            product_photo: row.product_photo || null,
            barcode: row.barcode || null,
          };
          inventoryItems.push(item);
        })
        .on("end", async () => {
          try {
            // Save all items to the database
            await Inventory.insertMany(inventoryItems);
            res.status(201).json({
              message: "Inventory imported successfully",
              success: true,
              data: inventoryItems,
            });
          } catch (dbError) {
            console.error("Error saving to database:", dbError);
            res.status(500).json({
              message: "Error saving inventory to database",
              success: false,
              error: dbError.message,
            });
          } finally {
            // Clean up: Delete the temporary CSV file
            fs.unlinkSync(filePath);
          }
        });
    } catch (error) {
      console.error("Error processing CSV file:", error);
      res.status(500).json({
        message: "Error processing CSV file",
        success: false,
        error: error.message,
      });

      // Clean up: Delete the temporary CSV file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  });
};
