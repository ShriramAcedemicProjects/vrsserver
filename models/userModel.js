const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "sales", "support", "customer"],
      default: "customer",
    },
    InsertionDate: {
        type: Date,
        default: Date.now,
      },
      ModificationDate: {
        type: Date,
        
      },
      IP: {
        type: String,
        default: "0.0.0.0",
      },
      Creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin", // If another admin creates an admin
        default: null,
      },
      Active: {
        type: Boolean,
        default: true,
      },
  });

module.exports = mongoose.model("adminlogin", userSchema,"adminlogin");
