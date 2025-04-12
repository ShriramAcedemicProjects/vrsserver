const express = require('express');
const router = express.Router();
const Booking = require('../models/BookingModel');
const VerifyToken = require('../middlewares/authMiddleware'); // Optional


router.post('/CreateBooking', VerifyToken, async (req, res) => {
  const {
    customerId,
    routeId,
    vehicleId,
    vehicleType,
    travelDate,
    rentAmount,
    paymentStatus,
  } = req.body;

  console.log("Received booking request:", req.body);

  try {
    // Create and save the booking
    const newBooking = new Booking({
      customerId,
      routeId,
      vehicleId,
      vehicleType,
      travelDate,
      rentAmount,
      paymentStatus,
      bookingDate: new Date(), // Optional as default is set
    });

    const savedBooking = await newBooking.save();

    res.status(201).json({
      message: "Booking created successfully",
      booking: savedBooking,
    });
  } catch (error) {
    console.error("Error creating booking:", error.message);
    res.status(500).json({
      message: "Failed to create booking",
      error: error.message,
    });
  }
});

module.exports = router;
