const express = require('express');
const router = express.Router();
const Booking = require('../models/BookingModel');
const TravelRoute = require("../models/TravelRouteModel");
const Vehicle = require("../models/VehicleModel");
const Driver = require("../models/DriverModel");
const VerifyToken = require('../middlewares/authMiddleware'); // Optional

router.get("/getAvailableVehicles",VerifyToken, async (req, res) => {
  try {
    const { type, source, destination } = req.query;

    if (!type || !source || !destination) {
      return res.status(400).json({ code: 0, message: "Missing required parameters." });
    }

    // Find the travel route
    const route = await TravelRoute.findOne({
      source: source,
      destination: destination,
      Active: true
    });

    if (!route) {
      return res.status(404).json({ code: 0, message: "No route found for given source and destination." });
    }

    const vehicleIds = type === "Car" ? route.carIds : route.autoIds;

    if (!vehicleIds || vehicleIds.length === 0) {
      return res.status(200).json({ code: 1, vehicles: [] }); // No vehicles mapped
    }

    // Find already booked vehicle IDs on that route (that are not completed or cancelled)
    const bookedVehicles = await Booking.find({
      routeId: route._id,
      vehicleType: type,
      status: "Booked"
    }).select("vehicleId");

    const bookedVehicleIds = bookedVehicles.map(b => b.vehicleId.toString());

    // Filter out the booked vehicles
    const availableVehicleIds = vehicleIds.filter(
      id => !bookedVehicleIds.includes(id.toString())
    );

    // Fetch vehicle details
    const availableVehicles = await Vehicle.find({
      _id: { $in: availableVehicleIds },
      Active: true
    });

    return res.status(200).json({
      code: 1,
      vehicles: availableVehicles,
      kilometer: route.kilometer // ➕ Include kilometer here
    });

  } catch (error) {
    console.error("Error fetching available vehicles:", error);
    return res.status(500).json({ code: 0, message: "Server error. Failed to fetch vehicles." });
  }
});


router.post('/CreateBooking', VerifyToken, async (req, res) => {
  const {
    source,
    destination,
    vehicleId,
    vehicleType,
    travelDateTime,
    rentAmount,
    paymentStatus,
  } = req.body;

  console.log("Received booking request:", req.body);
  console.log("Logged-in User ID:", req.user.id);

  try {
    // Step 1: Find the TravelRoute
    const route = await TravelRoute.findOne({
      source,
      destination,
      Active: true
    });

    if (!route) {
      return res.status(404).json({ message: "Route not found for the given source and destination." });
    }

    // Step 2: Create the booking
    const newBooking = new Booking({
      customerId: req.user.id,
      routeId: route._id,
      vehicleId,
      vehicleType,
      travelDateTime,
      rentAmount,
      paymentStatus,
      Creator:req.user.id,
      bookingDate: new Date(),
    });

    const savedBooking = await newBooking.save();

    res.status(201).json({
      message: "Vehicle Booked successfully",
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

router.get('/customerBookings', VerifyToken, async (req, res) => {
  try {
    // Step 1: Get all bookings for the logged-in customer
    const bookings = await Booking.find({ customerId: req.user.id })
      .populate('routeId')
      .populate('vehicleId')
      .sort({ travelDate: 1 });

    // Step 2: Fetch driver details for each booking using vehicleId
    const bookingsWithDriver = await Promise.all(
      bookings.map(async (booking) => {
        const driver = await Driver.findOne({ vehicleId: booking.vehicleId._id });

        return {
          ...booking.toObject(),
          driver: driver ? {
            name: driver.driverName,
            mobile: driver.driverMobile,
          } : null,
        };
      })
    );

    res.status(200).json({ code: 1, bookings: bookingsWithDriver });
  } catch (error) {
    console.error("Error fetching customer bookings:", error);
    res.status(500).json({ code: 0, message: "Server error fetching bookings." });
  }
});

router.put('/cancel/:id', VerifyToken, async (req, res) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, customerId: req.user.id },
      { status: "Cancelled" },
      { new: true }
    );

    if (!booking) {
      return res.json({ code: 0, message: "Booking not found or unauthorized." });
    }

    res.json({ code: 1, message: "Booking cancelled successfully.", booking });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.json({ code: 0, message: "Failed to cancel booking." });
  }
});

router.put('/complete/:id/:CustomerId', VerifyToken, async (req, res) => {
  try {
    console.log(req.params.id+"-"+req.params.CustomerId)
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, customerId: req.params.CustomerId },
      { status: "Completed" },
      { new: true }
    );

    if (!booking) {
      return res.json({ code: 0, message: "Booking not found or unauthorized." });
    }

    res.json({ code: 1, message: "Booking Completed successfully.", booking });
  } catch (error) {
    console.error("Complete booking error:", error);
    res.json({ code: 0, message: "Failed to Complete booking." });
  }
});

router.get('/VehicleBookingInfo', VerifyToken, async (req, res) => {
  try {
    // 1. Get logged-in driver ID from token
    const driverId = req.user.id;
    console.log(driverId)
    // 2. Get driver's assigned vehicle
    const driver = await Driver.findById(driverId);
    if (!driver || !driver.vehicleId) {
      return res.json({ code: 0, message: "Driver or assigned vehicle not found." });
    }

    // 3. Fetch bookings for this vehicle
    const bookings = await Booking.find({ vehicleId: driver.vehicleId })
      .populate('routeId')
      .populate('vehicleId')
      .populate('customerId', '_id firstName lastName mobile') // assuming fields exist in adminlogin collection
      .sort({ travelDateTime: 1 });

    res.json({ code: 1, bookings });

  } catch (error) {
    console.error("Error fetching vehicle bookings:", error);
    res.json({ code: 0, message: "Server error fetching vehicle bookings." });
  }
});

module.exports = router;
