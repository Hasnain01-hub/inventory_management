const customerModal = require("../modal/customer.modal");

exports.fetchAllCustomer = async (req, res) => {
  if (req.admin) {
    await customerModal.find({}, async (err, customer) => {
      if (err) {
        console.log(err);
        return res.status(401).json({
          message: "No Customer found",
          success: false,
        });
      }

      if (customer.length > 0) {
        return res.status(200).json({
          data: customer,
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

//Create Customer
exports.createCustomer = async (req, res) => {
  try {
    if (req.admin.type !== "ADMIN" && req.admin.type !== "SUPER_ADMIN") {
      return res.status(401).json({
        message: "You are not authorized to delete expenses",
        success: false,
      });
    }

    const {
      name,
      customer_id,
      facebook_profile_url,
      date_added,
      country,
      address,
    } = req.body;

    // Create warehouse record
    const customer = new customerModal({
      name,
      customer_id,
      facebook_profile_url,
      date_added,
      country,
      address,
    });

    // Save to database
    await customer.save();

    return res.status(200).json({
      message: "Customer created successfully",
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error("Error creating customer:", error);
    return res.status(500).json({
      message: "Error creating customer",
      success: false,
      data: null,
      error: error.message,
    });
  }
};

//Edit Customer
exports.editCustomer = async (req, res) => {
  try {
    if (req.admin.type !== "ADMIN" && req.admin.type !== "SUPER_ADMIN") {
      return res.status(401).json({
        message: "You are not authorized to delete expenses",
        success: false,
      });
    }

    const {
      name,
      customer_id,
      facebook_profile_url,
      date_added,
      country,
      address,
    } = req.body;

    // Find the customer record to update
    const customer = await customerModal.findById(req.params.id);
    if (!customer) {
      return res
        .status(404)
        .json({ message: "Customer not found", success: false });
    }

    // Update the customer fields
    customer.name = name || customer.name;
    customer.customer_id = customer_id || customer.customer_id;
    customer.facebook_profile_url =
      facebook_profile_url || customer.facebook_profile_url;
    customer.date_added = date_added || customer.date_added;
    customer.country = country || customer.country;
    customer.address = address || customer.address;

    // Save the updated customer record
    await customer.save();

    return res.status(200).json({
      message: "Customer updated successfully",
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error("Error updating customer:", error);
    return res.status(500).json({
      message: "Error updating customer",
      success: false,
      error: error.message,
    });
  }
};

//Delete Customer
exports.deleteCustomer = async (req, res) => {
  try {
    if (req.admin.type !== "ADMIN" && req.admin.type !== "SUPER_ADMIN") {
      return res.status(401).json({
        message: "You are not authorized to delete expenses",
        success: false,
      });
    }

    // Find the customer record to delete
    const customer = await customerModal.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res
        .status(404)
        .json({ message: "Customer not found", success: false });
    }

    return res.status(200).json({
      message: "Customer deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return res.status(500).json({
      message: "Error deleting customer",
      success: false,
      error: error.message,
    });
  }
};
