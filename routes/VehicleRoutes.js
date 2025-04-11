const express = require("express");
const router = express.Router();
const Vehicle = require("../models/VehicleModel");
const VerifyToken = require("../middlewares/authMiddleware");

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



module.exports = router;
