const purchaseModal = require("../modal/purchase.modal");

exports.fetchAllPurchase = async (req, res) => {
  if (req.admin) {
    await purchaseModal.find({}, async (err, purchase) => {
      if (err) {
        console.log(err);
        return res.status(401).json({
          message: "No Purchase found",
          success: false,
        });
      }

      if (purchase.length > 0) {
        return res.status(200).json({
          data: purchase,
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

//Create Purchase
exports.createPurchase = async (req, res) => {
  try {
    if (req.admin.type !== "ADMIN" && req.admin.type !== "SUPER_ADMIN") {
      return res.status(401).json({
        message: "You are not authorized to delete order",
        success: false,
      });
    }

    const {
      item_name,
      sku,
      quantity,
      shipment_id,
      import_price,
      import_currency,
      supplier_name,
      supplier_url,
      status,
      description,
    } = req.body;

    // Create warehouse record
    const purchase = new purchaseModal({
      item_name,
      sku,
      quantity,
      shipment_id,
      import_price,
      import_currency,
      supplier_name,
      supplier_url,
      status,
      description,
    });

    // Save to database
    await purchase.save();

    return res.status(200).json({
      message: "Purchase created successfully",
      success: true,
      data: purchase,
    });
  } catch (error) {
    console.error("Error creating purchase:", error);
    return res.status(500).json({
      message: "Error creating purchase",
      success: false,
      data: null,
      error: error.message,
    });
  }
};

//Edit Purchase
exports.editPurchase = async (req, res) => {
  try {
    if (req.admin.type !== "ADMIN" && req.admin.type !== "SUPER_ADMIN") {
      return res.status(401).json({
        message: "You are not authorized to delete order",
        success: false,
      });
    }

    const {
      item_name,
      sku,
      quantity,
      shipment_id,
      import_price,
      import_currency,
      supplier_name,
      supplier_url,
      status,
      description,
    } = req.body;

    // Find the purchase record to update
    const purchase = await purchaseModal.findById(req.params.id);
    if (!purchase) {
      return res
        .status(404)
        .json({ message: "Purchase not found", success: false });
    }

    // Update the purchase fields
    purchase.item_name = item_name || purchase.item_name;
    purchase.sku = sku || purchase.sku;
    purchase.quantity = quantity || purchase.quantity;
    purchase.shipment_id = shipment_id || purchase.shipment_id;
    purchase.import_price = import_price || purchase.import_price;
    purchase.import_currency = import_currency || purchase.import_currency;
    purchase.supplier_name = supplier_name || purchase.supplier_name;
    purchase.supplier_url = supplier_url || purchase.supplier_url;
    purchase.status = status || purchase.status;
    purchase.description = description || purchase.description;

    // Save the updated purchase record
    await purchase.save();

    return res.status(200).json({
      message: "Purchase updated successfully",
      success: true,
      data: purchase,
    });
  } catch (error) {
    console.error("Error updating purchase:", error);
    return res.status(500).json({
      message: "Error updating purchase",
      success: false,
      error: error.message,
    });
  }
};

//Delete Purchase
exports.deletePurchase = async (req, res) => {
  try {
    if (req.admin.type !== "ADMIN" && req.admin.type !== "SUPER_ADMIN") {
      return res.status(401).json({
        message: "You are not authorized to delete order",
        success: false,
      });
    }

    // Find the purchase record to delete
    const purchase = await purchaseModal.findByIdAndDelete(req.params.id);
    if (!purchase) {
      return res
        .status(404)
        .json({ message: "Purchase not found", success: false });
    }

    return res.status(200).json({
      message: "Purchase deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error deleting purchase:", error);
    return res.status(500).json({
      message: "Error deleting purchase",
      success: false,
      error: error.message,
    });
  }
};
