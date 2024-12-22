const customerModal = require("../modal/customer.modal");
const { csv_upload } = require("../helpers/fileUpload");
const fs = require("fs");
const csvParser = require("csv-parser");

/* The `exports.fetchAllCustomer` function is responsible for fetching all customer records from the
database. Here's a breakdown of what it does: */
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
/* The `exports.createCustomer` function is responsible for creating a new customer record in the
database. Here's a breakdown of what it does: */
exports.createCustomer = async (req, res) => {
  try {
    if (req.admin.type !== "ADMIN" && req.admin.type !== "SUPER_ADMIN") {
      return res.status(401).json({
        message: "You are not authorized to delete expenses",
        success: false,
      });
    }

    const {
      customer_name,
      customer_id,
      facebook_profile_url,
      date_added,
      country,
      address,
    } = req.body;

    // Create warehouse record
    const customer = new customerModal({
      customer_name,
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
/* The `exports.editCustomer` function is responsible for updating an existing customer record in the
database. Here's a breakdown of what it does: */
exports.editCustomer = async (req, res) => {
  try {
    if (req.admin.type !== "ADMIN" && req.admin.type !== "SUPER_ADMIN") {
      return res.status(401).json({
        message: "You are not authorized to delete expenses",
        success: false,
      });
    }

    const {
      customer_name,
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
    customer.customer_name = customer_name || customer.customer_name;
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
/* The `exports.deleteCustomer` function is responsible for deleting a customer record from the
database. Here's a breakdown of what it does: */
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

exports.importCustomersFromCSV = async (req, res) => {
  console.log(csv_upload);
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
      const customerItems = [];

      // Read and parse the CSV file
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on("data", (row) => {
          // Ensure each row contains valid data matching the Customer schema
          const customer = {
            customer_name: row.customer_name,
            customer_id: row.customer_id,
            facebook_profile_url: row.facebook_profile_url || null,
            date_added: row.date_added ? new Date(row.date_added) : Date.now(),
            country: row.country,
            address: row.address,
          };
          customerItems.push(customer);
        })
        .on("end", async () => {
          try {
            // Save all customers to the database
            await customerModal.insertMany(customerItems);
            res.status(201).json({
              message: "Customers imported successfully",
              success: true,
              data: customerItems,
            });
          } catch (dbError) {
            console.error("Error saving to database:", dbError);
            res.status(500).json({
              message: "Error saving customers to database",
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
