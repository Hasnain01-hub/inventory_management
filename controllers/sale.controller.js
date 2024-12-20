const saleModal = require("../modal/sale.modal");

exports.fetchAllSale = async (req, res) => {
  if (req.admin) {
    await saleModal.find({}, async (err, sale) => {
      if (err) {
        console.log(err);
        return res.status(401).json({
          message: "No Sale found",
          success: false,
        });
      }

      if (sale.length > 0) {
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

//Create Sale
exports.createSale = async (req, res) => {
  try {
    if (req.admin.type !== "ADMIN" && req.admin.type !== "SUPER_ADMIN") {
      return res.status(401).json({
        message: "You are not authorized to delete order",
        success: false,
      });
    }
    const {
      discount_id,
      discount_name,
      discount_percentage,
      status,
      from_date,
      to_date,
      application_scope,
      product_name,
    } = req.body;

    // Create warehouse record
    const purchase = new saleModal({
      discount_id,
      discount_name,
      discount_percentage,
      status,
      from_date,
      to_date,
      application_scope,
      product_name,
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

//Edit Sale
exports.editSale = async (req, res) => {
  try {
    if (req.admin.type !== "ADMIN" && req.admin.type !== "SUPER_ADMIN") {
      return res.status(401).json({
        message: "You are not authorized to delete order",
        success: false,
      });
    }
    const {
      discount_id,
      discount_name,
      discount_percentage,
      status,
      from_date,
      to_date,
      application_scope,
      product_name,
    } = req.body;

    // Find the sale record to update
    const sale = await saleModal.findById(req.params.id);
    if (!sale) {
      return res
        .status(404)
        .json({ message: "Sale not found", success: false });
    }

    // Update the sale fields
    sale.discount_id = discount_id || sale.discount_id;
    sale.discount_name = discount_name || sale.discount_name;
    sale.discount_percentage = discount_percentage || sale.discount_percentage;
    sale.status = status || sale.status;
    sale.from_date = from_date || sale.from_date;
    sale.to_date = to_date || sale.to_date;
    sale.application_scope = application_scope || sale.application_scope;
    sale.product_name = product_name || sale.product_name;

    // Save the updated sale record
    await sale.save();

    return res.status(200).json({
      message: "Sale updated successfully",
      success: true,
      data: sale,
    });
  } catch (error) {
    console.error("Error updating sale:", error);
    return res.status(500).json({
      message: "Error updating sale",
      success: false,
      error: error.message,
    });
  }
};

//Delete Sale
exports.deleteSale = async (req, res) => {
  try {
    if (req.admin.type !== "ADMIN" && req.admin.type !== "SUPER_ADMIN") {
      return res.status(401).json({
        message: "You are not authorized to delete order",
        success: false,
      });
    }

    // Find the sale record to delete
    const sale = await saleModal.findByIdAndDelete(req.params.id);
    if (!sale) {
      return res
        .status(404)
        .json({ message: "Sale not found", success: false });
    }

    return res.status(200).json({
      message: "Sale deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error deleting sale:", error);
    return res.status(500).json({
      message: "Error deleting sale",
      success: false,
      error: error.message,
    });
  }
};
