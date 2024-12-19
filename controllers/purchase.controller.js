const purchaseModal = require("../modal/purchase.modal");

exports.fetchAllPurchase = async (req, res) => {
  if (req.user) {
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

exports.createPurchase = async (req, res) => {
  try {
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
