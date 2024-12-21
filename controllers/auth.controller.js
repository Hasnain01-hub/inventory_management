const Admin = require("../modal/admin.modal");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const SECRET_KEY = process.env.JWT_SECRET; // JWT secret key

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

async function createAdmin(req, res) {
  const { username, password } = req.body;
  try {
    if (req.admin.type !== "SUPER_ADMIN") {
      return res
        .status(401)
        .json({ error: "You are not authorized to create admin" });
    }
    console.log(username, password, "req.admin");
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
