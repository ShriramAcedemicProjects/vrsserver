const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "adminlogin", // Assuming your customer model is 'User'
    required: true,
  },
  routeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TravelRoute",
    required: true,
  },
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle",
    required: true,
  },
  vehicleType: {
    type: String,
    enum: ["Auto", "Car"],
    required: true,
  },
  bookingDate: {
    type: Date,
    default: Date.now,
  },
  travelDateTime: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["Booked", "Completed", "Cancelled"],
    default: "Booked",
  },
  rentAmount: {
    type: Number,
    required: true,
  },
 
  paymentStatus: {
    type: String,
    enum: ["Pending", "Paid"],
    default: "Pending",
  },

  Creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "adminlogin",
    default: null,
  },
  Active: {
    type: Boolean,
    default: true,
  },
},{ timestamps: true,});

const Booking = mongoose.model("Booking", bookingSchema, "Booking");

module.exports = Booking;
