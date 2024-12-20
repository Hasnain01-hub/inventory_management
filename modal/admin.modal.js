const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const adminSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    default: "ADMIN",
    enum: ["ADMIN", "SUPER_ADMIN"],
    validate: {
      validator: function (value) {
        return ["ADMIN", "SUPER_ADMIN"].includes(value);
      },
      message: (props) => `${props.value} is not a valid admin type`,
    },
  },
  password: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
});

// Pre-save hook for validation and password hashing
adminSchema.pre("save", async function (next) {
  try {
    const user = this;

    // Check if the username is being modified and ensure uniqueness
    if (user.isModified("username")) {
      const existingUser = await mongoose.models.Admin.findOne({
        username: user.username,
      });

      if (existingUser) {
        const error = new Error(
          "Username is already taken. Please choose another one."
        );
        error.name = "ValidationError";
        return next(error);
      }
    }

    // Hash the password if it is being modified
    if (user.isModified("password")) {
      const salt = await bcrypt.genSalt(10); // Generate salt
      user.password = await bcrypt.hash(user.password, salt); // Hash the password
    }

    next();
  } catch (err) {
    next(err); // Pass any errors to the next middleware
  }
});

// Add method to validate password
adminSchema.methods.isValidPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
