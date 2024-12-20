const returnModal = require("../modal/return.modal");

exports.fetchAllReturn = async (req, res) => {
  if (req.admin) {
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

//Create Returns
exports.createReturn = async (req, res) => {
  try {
    if (req.admin.type !== "ADMIN" && req.admin.type !== "SUPER_ADMIN") {
      return res.status(401).json({
        message: "You are not authorized to delete order",
        success: false,
      });
    }

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

//Edit Return
exports.editReturn = async (req, res) => {
  try {
    if (req.admin.type !== "ADMIN" && req.admin.type !== "SUPER_ADMIN") {
      return res.status(401).json({
        message: "You are not authorized to delete order",
        success: false,
      });
    }

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

    // Find the return record to update
    const returns = await returnModal.findById(req.params.id);
    if (!returns) {
      return res
        .status(404)
        .json({ message: "Return not found", success: false });
    }

    // Update the return fields
    returns.return_id = return_id || returns.return_id;
    returns.customer_name = customer_name || returns.customer_name;
    returns.order_number = order_number || returns.order_number;
    returns.return_date = return_date || returns.return_date;
    returns.return_type = return_type || returns.return_type;
    returns.status = status || returns.status;
    returns.note = note || returns.note;
    returns.items_returned = items_returned
      ? JSON.parse(items_returned)
      : returns.items_returned;

    // Save the updated return record
    await returns.save();

    return res.status(200).json({
      message: "Return updated successfully",
      success: true,
      data: returns,
    });
  } catch (error) {
    console.error("Error updating return:", error);
    return res.status(500).json({
      message: "Error updating return",
      success: false,
      error: error.message,
    });
  }
};

//Delete Return
exports.deleteReturn = async (req, res) => {
  try {
    if (req.admin.type !== "ADMIN" && req.admin.type !== "SUPER_ADMIN") {
      return res.status(401).json({
        message: "You are not authorized to delete order",
        success: false,
      });
    }

    // Find the return record to delete
    const returns = await returnModal.findByIdAndDelete(req.params.id);
    if (!returns) {
      return res
        .status(404)
        .json({ message: "Return not found", success: false });
    }

    return res.status(200).json({
      message: "Return deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error deleting return:", error);
    return res.status(500).json({
      message: "Error deleting return",
      success: false,
      error: error.message,
    });
  }
};
