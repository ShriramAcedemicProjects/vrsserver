const express = require("express");
const router = express.Router();
const Vehicle = require("../models/VehicleModel");
const VerifyToken = require("../middlewares/authMiddleware");
const Booking =require("../models/BookingModel")
const TravelRoute = require("../models/TravelRouteModel");

// ✅ Add a new vehicle (Admin only)
router.post("/VehicleAdd", VerifyToken, async (req, res) => {
  
  try {
    const { vehicleName, vehicleNumber, vehicleCategory, seatingCapacity, rentPerDay, fuelEfficiency } = req.body;

    // Check if vehicle already exists
    const existingVehicle = await Vehicle.findOne({ vehicleNumber });
    if (existingVehicle) return res.status(400).json({ message: "Vehicle already exists" });

    const newVehicle = new Vehicle({ vehicleName, vehicleNumber, vehicleType:vehicleCategory, seatingCapacity, rentPerDay, fuelEfficiency });
    await newVehicle.save();

    res.status(201).json({ message: "Vehicle added successfully", vehicle: newVehicle });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ Get all vehicles (Public)
router.get("/Vehiclelist",VerifyToken, async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ Get a single vehicle by ID (Public)
router.get("/ListID/:id",VerifyToken, async (req, res) => {
  try {
    //console.log(req.params.id)
    const vehicle = await Vehicle.findById(req.params.id);
    //console.log(vehicle)
    if (!vehicle) return res.json({ message: "Vehicle not found" });
    res.json(vehicle);
  } catch (error) {
    res.json({ message: "Server error", error: error.message });
  }
});

// ✅ Update vehicle details (Admin only)
router.put("/VehicleUpdate/:id",VerifyToken, async (req, res) => {
  try {
    const updatedVehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedVehicle) return res.status(404).json({ message: "Vehicle not found" });

    res.status(200).json({ message: "Vehicle updated successfully", vehicle: updatedVehicle });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ Delete a vehicle (Admin only)
router.delete("/VehicleDelete/:id", VerifyToken, async (req, res) => {
  try {
    const deletedVehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!deletedVehicle) return res.status(404).json({ message: "Vehicle not found" });

    res.status(200).json({ message: "Vehicle deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Fetch Auto List
router.get("/getAutoList" ,VerifyToken, async (req, res) => {
  try {
    const autos = await Vehicle.find({ vehicleType: "Auto", Active: true }).sort({ vehicleName: 1 });
    res.status(200).json(autos);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch Auto List" });
  }
 });

 // Fetch Car List
router.get("/getCarList",VerifyToken, async (req, res) => {
  try {
    const cars = await Vehicle.find({ vehicleType: "Car", Active: true }).sort({ vehicleName: 1 });
    res.status(200).json(cars);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch Car List" });
  }
});


// Route to fetch available vehicles based on source, destination, vehicleType, and travelDateTime
router.get("/available", async (req, res) => {
  try {
    const { source, destination, vehicleType, travelDateTime } = req.query;

    // Log the query parameters to check if they're being received correctly
    console.log("Received Query Params:", req.query);

    // Check if all required parameters are provided
    if (!source || !destination || !vehicleType || !travelDateTime) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    // 1. Find the matching route for the selected source and destination
    const route = await TravelRoute.findOne({ source, destination }).populate(
      vehicleType === "Car" ? "carIds" : "autoIds"
    );
    if (!route) {
      return res.status(404).json({ message: "Route not found for the selected source and destination" });
    }

    // 2. Get the list of vehicles based on vehicle type (Car or Auto)
    const vehicles = vehicleType === "Car" ? route.carIds : route.autoIds;

    // 3. Get already booked vehicles for the selected travel date/time
    const bookedVehicles = await Booking.find({
      routeId: route._id,
      travelDate: { $eq: new Date(travelDateTime) }, // Match the exact travel date
      status: { $ne: "Cancelled" }, // Exclude cancelled bookings
    }).distinct("vehicleId"); // Get distinct vehicleIds that are booked

    // 4. Filter out the vehicles that are already booked
    const availableVehicles = vehicles.filter(
      (v) => !bookedVehicles.includes(v._id.toString()) && v.Active // Check if vehicle is not booked and is active
    );

    // 5. Return the available vehicles
    res.status(200).json(availableVehicles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});







module.exports = router;
