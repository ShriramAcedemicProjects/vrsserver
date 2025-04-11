const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
  vehicleName: { type: String, required: true, trim: true },
  vehicleNumber: { type: String, required: true, unique: true, trim: true },
  vehicleType: { type: String, required: true, enum: ["Auto", "Car"] },
  seatingCapacity: { type: Number, required: true, min: 1 },
  rentPerDay: { type: Number, required: true, min: 0 },  // Added rental price per day
  fuelEfficiency: { type: Number, min: 0,default:0 },  // Optional: Fuel efficiency in km/l
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

const Vehicle = mongoose.model("Vehicle", vehicleSchema,"Vehicle");
module.exports = Vehicle;
