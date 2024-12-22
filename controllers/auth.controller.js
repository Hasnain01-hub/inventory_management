const Admin = require("../modal/admin.modal");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const SECRET_KEY = process.env.JWT_SECRET; // JWT secret key

/**
 * The `loginAdmin` function handles the authentication process for an admin user, including finding
 * the admin by username, validating the password, and generating a JWT token for successful logins.
 * @param req - The `req` parameter in the `loginAdmin` function is typically the request object
 * representing the HTTP request made to the server. It contains information about the request such as
 * headers, parameters, body, and more. In this case, `req.body` is used to extract the `username` and
 * @param res - The `res` parameter in the `loginAdmin` function is the response object that will be
 * used to send the response back to the client making the request. It is typically an instance of the
 * Express response object that allows you to send HTTP responses with data such as status codes,
 * headers, and JSON
 * @returns The `loginAdmin` function returns a JSON response based on the outcome of the login
 * process. Here are the possible return scenarios:
 */
const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find the admin by username
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res
        .status(401)
        .json({ message: "Admin not found", success: false });
    }

    // Validate the password
    const isValidPassword = await admin.isValidPassword(password);
    if (!isValidPassword) {
      return res
        .status(401)
        .json({ message: "Invalid credentials", success: false });
    }

    // Generate JWT token without expiration
    const token = jwt.sign(
      { id: admin._id, username: admin.username }, // Payload
      SECRET_KEY // Secret key
    );

    return res.status(200).json({
      message: "Login successful",
      success: true,
      token: token,
      data: {
        id: admin._id,
        username: admin.username,
        type: admin.type,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message,
    });
  }
};

/**
 * The function `createAdmin` is an asynchronous function that creates a new admin user if the
 * requester is a SUPER_ADMIN and handles errors appropriately.
 * @param req - The `req` parameter in the `createAdmin` function typically represents the request
 * object in Node.js or Express.js. It contains information about the HTTP request made to the server,
 * including headers, parameters, body, and other details. In this specific function, `req.body` is
 * used to extract
 * @param res - The `res` parameter in the `createAdmin` function is the response object that will be
 * used to send the response back to the client making the request. It is typically used to set the
 * status code, send data back in the response body, or handle errors.
 * @returns If the request is made by an admin with type "SUPER_ADMIN", a new admin with the provided
 * username, password, and type "ADMIN" will be created and saved to the database. If successful, the
 * response will have a status of 201 and a message "admin registered successfully!".
 */
async function createAdmin(req, res) {
  const { username, password } = req.body;
  try {
    if (req.admin.type !== "SUPER_ADMIN") {
      return res
        .status(401)
        .json({ error: "You are not authorized to create admin" });
    }
    const newUser = new Admin({ username, password, type: "ADMIN" });
    await newUser.save();
    res.status(201).send("admin registered successfully!");
  } catch (err) {
    if (err.name === "ValidationError") {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

/**
 * The function `editAdmin` updates the password and type of an admin if authorized as a SUPER_ADMIN.
 * @param req - The `req` parameter in the `editAdmin` function represents the request object that
 * contains information sent by the client to the server. It includes data such as the admin's
 * username, password, and type that are needed to update the admin details.
 * @param res - The `res` parameter in the `editAdmin` function is the response object that will be
 * used to send the response back to the client making the request. It is typically used to set the
 * status code, send JSON data, or handle errors in the response.
 * @returns The `editAdmin` function returns a response based on the following conditions:
 * 1. If the requesting admin is not a SUPER_ADMIN, it returns a 401 status with an error message
 * stating "You are not authorized to update admin details".
 * 2. If the admin to be updated is not found, it returns a 404 status with an error message stating
 * "Admin not found".
 * 3. If the
 */
async function editAdmin(req, res) {
  const { username, password, type } = req.body;
  try {
    if (req.admin.type !== "SUPER_ADMIN") {
      return res
        .status(401)
        .json({ error: "You are not authorized to update admin details" });
    }

    // Find the admin by username
    const adminToUpdate = await Admin.findOne({ username });
    if (!adminToUpdate) {
      return res.status(404).json({ error: "Admin not found" });
    }

    // Update password and type if provided
    if (password) {
      const isSamePassword = await bcrypt.compare(
        password,
        adminToUpdate.password
      );
      if (!isSamePassword) {
        const salt = await bcrypt.genSalt(10); // Generate salt
        adminToUpdate.password = await bcrypt.hash(password, salt); // Hash the new password
      }
    }

    if (type) adminToUpdate.type = type;

    // Save the updated admin
    await adminToUpdate.save();

    res.status(200).json({ message: "Admin updated successfully" });
  } catch (err) {
    if (err.name === "ValidationError") {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

/**
 * The function `deleteUser` is an asynchronous function that deletes a user based on the provided
 * username if the requester has SUPER_ADMIN permissions, handling errors appropriately.
 * @param req - The `req` parameter typically represents the HTTP request in Express.js or similar
 * frameworks. It contains information about the request made by the client, such as request headers,
 * parameters, body, and more.
 * @param res - The `res` parameter in the `deleteUser` function is the response object that will be
 * used to send the response back to the client making the request. It is typically used to set the
 * status code, send JSON data, or handle errors when deleting a user.
 * @returns The `deleteUser` function returns different responses based on the conditions:
 */
const deleteUser = async (req, res) => {
  const { username } = req.body;

  try {
    // Check if the user has the required permissions
    if (req.admin.type !== "SUPER_ADMIN") {
      return res
        .status(401)
        .json({ error: "You are not authorized to delete users" });
    }

    // Find and delete the user by username
    const userToDelete = await Admin.findOneAndDelete({ username });

    if (!userToDelete) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { deleteUser };

module.exports = {
  loginAdmin,
  createAdmin,
  editAdmin,
  deleteUser,
};
