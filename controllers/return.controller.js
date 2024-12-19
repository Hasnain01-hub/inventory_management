const returnModal = require("../modal/return.modal");

exports.fetchAllReturn = async (req, res) => {
  if (req.user) {
    await returnModal.find({}, async (err, returns) => {
      if (err) {
        console.log(err);
        return res.status(401).json({
          message: "No Returns found",
          success: false,
        });
      }

      if (returns.length > 0) {
        return res.status(200).json({
          data: returns,
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

exports.createReturn = async (req, res) => {
  try {
    const {
      return_id,
      customer_name,
      order_number,
      return_date,
      return_type,
      status,
      note,
      items_returned,
    } = req.body;

    // Create warehouse record
    const returns = new returnModal({
      return_id,
      customer_name,
      order_number,
      return_date,
      return_type,
      status,
      note,
      items_returned: JSON.parse(items_returned),
    });

    // Save to database
    await returns.save();

    return res.status(200).json({
      message: "Return created successfully",
      success: true,
      data: returns,
    });
  } catch (error) {
    console.error("Error creating return:", error);
    return res.status(500).json({
      message: "Error creating return",
      success: false,
      data: null,
      error: error.message,
    });
  }
};
