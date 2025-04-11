const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema({
  driverName: { type: String, required: true },
  driverMobile: { type: String, required: true, unique: true },
  email: { type: String,},
  licenseNumber: { type: String, },
  licenceUpload: { type: String, required: false }, // Store file path or URL
  aadhaarCard: { type: String, required: false },  // Optional field
  panCard: { type: String, required: false },      // Optional field
  vehicleId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle", // If another admin creates an admin
    default: null,
  },
  username:String,
  password:String,
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
            ref: "adminlogin", // If another admin creates an admin
            default: null,
          },
          Active: {
            type: Boolean,
            default: true,
          }
});

const Driver = mongoose.model("Driver", driverSchema,"Driver");

module.exports = Driver;
