const customerModal = require("../modal/customer.modal");

exports.fetchAllCustomer = async (req, res) => {
  if (req.user) {
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

exports.createCustomer = async (req, res) => {
  try {
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
