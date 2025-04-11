const express = require("express");
const router = express.Router();
const TravelRoute = require("../models/TravelRouteModel");
const VerifyToken = require("../middlewares/authMiddleware");

// Add Route API
router.post("/addRoute", VerifyToken, async (req, res) => {
  try {
    const { source, destination, kilometer, autoIds, carIds } = req.body;

    // Check if route already exists (optional)
    const isExists = await TravelRoute.findOne({ source, destination });
    if (isExists) {
      return res.json({code:0, message: "Route already exists" });
    }

    const newRoute = new TravelRoute({
      source,
      destination,
      kilometer,
      autoIds,
      carIds,
    });

    await newRoute.save();
    res.json({code:1, message: "Route Added Successfully" });
  } catch (error) {
    res.json({code:0, message: "Server Error", error: error.message });
  }
});

// Get All Routes API

router.get("/RouteList", VerifyToken, async (req, res) => {
  try {
    const routes = await TravelRoute.find()
      .populate("autoIds", "vehicleNumber vehicleName")
      .populate("carIds", "vehicleNumber vehicleName")
      .sort({ createdAt: -1 });

    res.status(200).json(routes);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Get Route Details By ID API
router.get("/getRouteById/:id", VerifyToken, async (req, res) => {
  try {
    const routeId = req.params.id;

    const route = await TravelRoute.findById(routeId)
      .populate("autoIds", "vehicleNumber vehicleName")
      .populate("carIds", "vehicleNumber vehicleName");

    if (!route) {
      return res.json({code:0, message: "Route not found" });
    }

    res.status(200).json({code:1,route});
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Update Route API
router.put("/updateRoute/:routeId", async (req, res) => {
  const { routeId } = req.params;
  const { source, destination, kilometer, autoIds, carIds } = req.body;

  try {
    // Validation if needed
    if (!source || !destination || !kilometer) {
      return res.json({ code: 0, message: "All fields are required" });
    }

    const updatedRoute = await TravelRoute.findByIdAndUpdate(
      routeId,
      {
        source,
        destination,
        kilometer,
        autoIds,  // array of _id
        carIds,   // array of _id
      },
      { new: true }
    );

    if (!updatedRoute) {
      return res.json({ code: 0, message: "Route not found" });
    }

    res.json({
      code: 1,
      message: "Route updated successfully",
      route: updatedRoute,
    });
  } catch (error) {
    console.error("Update Route Error:", error.message);
    res.status(500).json({ code: 0, message: "Internal Server Error" });
  }
});

// Delete Route API
router.delete("/deleteRoute/:routeId", async (req, res) => {
  const { routeId } = req.params;

  try {
    const route = await TravelRoute.findById(routeId);

    if (!route) {
      return res.json({ code: 0, message: "Route not found" });
    }

    await TravelRoute.findByIdAndDelete(routeId);

    res.json({
      code: 1,
      message: "Route deleted successfully",
    });
  } catch (error) {
    console.error("Delete Route Error:", error.message);
    res.json({ code: 0, message: "Internal Server Error" });
  }
});

module.exports = router;
