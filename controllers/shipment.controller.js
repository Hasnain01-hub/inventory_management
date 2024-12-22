const shipmentModal = require("../modal/shipment.modal");
const { csv_upload } = require("../helpers/fileUpload");
const fs = require("fs");
const csvParser = require("csv-parser");

exports.fetchAllShipments = async (req, res) => {
  if (req.admin) {
    await shipmentModal.find({}, async (err, shipment) => {
      if (err) {
        return res.status(401).json({
          message: "No Shipments found",
          success: false,
        });
      }
      if (shipment.length > 0) {
        return res.status(200).json({
          data: shipment,
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

exports.createShipment = async (req, res) => {
  try {
    if (req.admin.type !== "ADMIN" && req.admin.type !== "SUPER_ADMIN") {
      return res.status(401).json({
        message: "You are not authorized to create shipment",
        success: false,
      });
    }
    const newShipment = new shipmentModal(req.body);
    newShipment.save((err, shipment) => {
      if (err) {
        return res.status(400).json({
          message: "Error creating shipment",
          success: false,
        });
      }
      return res.status(201).json({
        message: "Shipment created successfully",
        data: shipment,
        success: true,
      });
    });
  } catch (error) {
    console.error("Error creating shipment:", error);
    return res.status(500).json({
      message: "Error creating shipment",
      success: false,
      error: error.message,
    });
  }
};

exports.editShipment = async (req, res) => {
  try {
    if (req.admin.type !== "ADMIN" && req.admin.type !== "SUPER_ADMIN") {
      return res.status(401).json({
        message: "You are not authorized to edit shipment",
        success: false,
      });
    }
    const updatedShipment = await shipmentModal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedShipment) {
      return res.status(404).json({
        message: "Shipment not found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "Shipment updated successfully",
      data: updatedShipment,
      success: true,
    });
  } catch (error) {
    console.error("Error editing shipment:", error);
    return res.status(500).json({
      message: "Error editing shipment",
      success: false,
      error: error.message,
    });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    if (req.admin.type !== "ADMIN" && req.admin.type !== "SUPER_ADMIN") {
      return res.status(401).json({
        message: "You are not authorized to update shipment status",
        success: false,
      });
    }
    const updatedShipment = await shipmentModal.findByIdAndUpdate(
      req.params.id,
      { status: "DELIVERED" },
      { new: true }
    );
    if (!updatedShipment) {
      return res.status(404).json({
        message: "Shipment not found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "Shipment status updated successfully",
      data: updatedShipment,
      success: true,
    });
  } catch (err) {
    console.error("Error updating shipment status:", err);
    return res.status(500).json({
      message: "Error updating shipment status",
      success: false,
      error: err.message,
    });
  }
};

exports.deleteShipment = async (req, res) => {
  try {
    if (req.admin.type !== "ADMIN" && req.admin.type !== "SUPER_ADMIN") {
      return res.status(401).json({
        message: "You are not authorized to delete shipment",
        success: false,
      });
    }
    const deletedShipment = await shipmentModal.findByIdAndDelete(
      req.params.id
    );
    if (!deletedShipment) {
      return res.status(404).json({
        message: "Shipment not found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "Shipment deleted successfully",
      success: true,
    });
  } catch (err) {
    console.error("Error deleting shipment:", err);
    return res.status(500).json({
      message: "Error deleting shipment",
      success: false,
      error: err.message,
    });
  }
};

exports.importShipmentsFromCSV = async (req, res) => {
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
      const shipmentItems = [];

      // Read and parse the CSV file
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on("data", (row) => {
          // Ensure each row contains valid data matching the schema
          const shipment = {
            date_shipped: row.date_shipped,
            shipment_id: row.shipment_id,
            shipping_method: row.shipping_method,
            shipping_carrier: row.shipping_carrier,
            tracking_number: parseInt(row.tracking_number, 10),
            estimated_arrival: new Date(row.estimated_arrival),
            shipment_cost: parseFloat(row.shipment_cost),
            currency: row.currency,
            note: row.note || null,
            status: row.status,
            order_list: row.order_list ? row.order_list.split(",") : [], // Convert comma-separated IDs to array
          };
          shipmentItems.push(shipment);
        })
        .on("end", async () => {
          try {
            // Save all shipments to the database
            await shipmentModal.insertMany(shipmentItems);
            res.status(201).json({
              message: "Shipments imported successfully",
              success: true,
              data: shipmentItems,
            });
          } catch (dbError) {
            console.error("Error saving to database:", dbError);
            res.status(500).json({
              message: "Error saving shipments to database",
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
