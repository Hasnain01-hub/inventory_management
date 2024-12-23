const supplierModal = require("../modal/supplier.modal");
const { csv_upload } = require("../helpers/fileUpload");
const fs = require("fs");
const csvParser = require("csv-parser");

exports.fetchAllSupliers = async (req, res) => {
  if (req.admin) {
    await supplierModal.find({}, async (err, supplier) => {
      if (err) {
        console.log(err);
        return res.status(401).json({
          message: "No Supplier found",
          success: false,
        });
      }
      res.json({
        message: "All Suppliers",
        success: true,
        data: supplier,
      });
    });
  } else {
    res.status(401).json({
      message: "Admin not found!",
      success: false,
    });
  }
};

exports.addSupplier = async (req, res) => {
  try {
    if (req.admin) {
      const newSupplier = new supplierModal(req.body);
      newSupplier.save((err, supplier) => {
        if (err) {
          console.log(err);
          return res.status(401).json({
            message: "Failed to add Supplier",
            success: false,
          });
        }
        res.json({
          message: "Supplier added successfully",
          success: true,
          data: supplier,
        });
      });
    } else {
      res.status(401).json({
        message: "Admin not found!",
        success: false,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(401).json({
      message: "Failed to add Supplier",
      success: false,
    });
  }
};

exports.updateSupplier = async (req, res) => {
  try {
    if (req.admin) {
      await supplierModal.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true },
        (err, updatedSupplier) => {
          if (err) {
            console.log(err);
            return res.status(401).json({
              message: "Failed to update Supplier",
              success: false,
            });
          }
          res.json({
            message: "Supplier updated successfully",
            success: true,
            data: updatedSupplier,
          });
        }
      );
    } else {
      res.status(401).json({
        message: "Admin not found!",
        success: false,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(401).json({
      message: "Failed to update Supplier",
      success: false,
    });
  }
};

exports.deleteSupplier = async (req, res) => {
  try {
    if (req.admin) {
      await supplierModal.findByIdAndDelete(
        req.params.id,
        (err, deletedSupplier) => {
          if (err) {
            console.log(err);
            return res.status(401).json({
              message: "Failed to delete Supplier",
              success: false,
            });
          }
          res.json({
            message: "Supplier deleted successfully",
            success: true,
            data: deletedSupplier,
          });
        }
      );
    } else {
      res.status(401).json({
        message: "Admin not found!",
        success: false,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(401).json({
      message: "Failed to delete Supplier",
      success: false,
    });
  }
};

exports.importSuppliersFromCSV = async (req, res) => {
  csv_upload.single("csv_file")(req, res, async (err) => {
    if (err) {
      return res
        .status(400)
        .json({ message: "File upload error", success: false, err: err });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded. Please upload a CSV file.",
        success: false,
      });
    }

    const filePath = req.file.path;

    try {
      const supplierItems = [];

      // Read and parse the CSV file
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on("data", (row) => {
          // Ensure each row contains valid data matching the Supplier schema
          const supplier = {
            supplier_name: row.supplier_name,
            supplier_link: row.supplier_link,
            total_purchased: parseInt(row.total_purchased, 10),
            country: row.country,
            email: row.email,
            phone: row.phone,
            description: row.description,
            purchase_history: row.purchase_history
              ? row.purchase_history.split(",").map((id) => id.trim())
              : [], // Convert comma-separated purchase history IDs to array
          };
          supplierItems.push(supplier);
        })
        .on("end", async () => {
          try {
            // Save all suppliers to the database
            await supplierModal.insertMany(supplierItems);
            res.status(201).json({
              message: "Suppliers imported successfully",
              success: true,
              data: supplierItems,
            });
          } catch (dbError) {
            console.error("Error saving to database:", dbError);
            res.status(500).json({
              message: "Error saving suppliers to database",
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
