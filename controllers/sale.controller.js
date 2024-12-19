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

exports.createSale = async (req, res) => {
  try {
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
