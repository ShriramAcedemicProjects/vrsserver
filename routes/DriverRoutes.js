const express = require("express");
const router = express.Router();
const multer = require("multer");
const Driver = require("../models/DriverModel");
const VerifyToken = require("../middlewares/authMiddleware");
const getClientIP = require("../utlity/getIP")
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Configure Multer for File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Store files in the 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// Configure file filter
const fileFilter = (req, file, cb) => {
    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "application/pdf"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPG, PNG, and PDF are allowed."));
    }
  };


// Multer upload function
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
  }).fields([
    { name: "licenseFile", maxCount: 1 }, // License is mandatory
    { name: "aadhaarCard", maxCount: 1 }, // Optional
    { name: "panCard", maxCount: 1 }, // Optional
  ]);

// ✅ Add a New Driver (with file upload)
router.post(
  "/DriverAdd",
  VerifyToken,
  upload,
  async (req, res) => {    
    try {
         // Convert `req.body` to a plain object
    const driverData = JSON.parse(JSON.stringify(req.body));
    //console.log(driverData)
      const { driverName, driverMobile, email, licenseNumber } = driverData;

      // Validate Mandatory Fields
      if (!driverName || !driverMobile || !email || !licenseNumber) {
        return res.json({code:0, message: "All fields are required" });
      }
      
      if (!req.files["licenseFile"]) {
        return res.json({code:0, message: "Licence upload is required" });
      }

        // Check uploaded files
    const licenseFile = req.files["licenseFile"]
    ? req.files["licenseFile"][0].filename
    : "no_file.jpg";
  const aadhaarCard = req.files["aadhaarCard"]
    ? req.files["aadhaarCard"][0].filename
    : "no_file.jpg";
  const panCard = req.files["panCard"]
    ? req.files["panCard"][0].filename
    : "no_file.jpg";

      const newDriver = new Driver({
        driverName,
      driverMobile,
      email,
      licenseNumber,
      licenceUpload:licenseFile,
      aadhaarCard,
      panCard,
        InsertionDate:new Date(),
        IP:getClientIP(req),
        Creator:req.user.id
      });

      await newDriver.save();

      res.status(201).json({code:1, message: "Driver added successfully", driver: newDriver });
    } catch (error) {
        console.log(error.message)
      res.status(500).json({code:0,message: "Server error", error: error.message });
    }
  }
);

// ✅ Get All Drivers
router.get("/DriverList", VerifyToken, async (req, res) => {
  try {
    const drivers = await Driver.find();
    res.status(200).json(drivers);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ Get Single Driver by ID
router.get("/GetDriverById/:id", VerifyToken, async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) return res.json({code:0, message: "Driver not found" });

    res.status(200).json({code:1,driver});
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ Update Driver (File uploads handled)
router.put(
  "/DriverUpdate/:id",
  VerifyToken,
  upload,
  async (req, res) => {
    try {
      // Convert form fields to plain JS object
      const driverData = JSON.parse(JSON.stringify(req.body));
      const { driverName, driverMobile, email, licenseNumber } = driverData;

      // Prepare the object to update
      const updatedData = {
        ...(driverName && { driverName }),
        ...(driverMobile && { driverMobile }),
        ...(email && { email }),
        ...(licenseNumber && { licenseNumber }),
      };

      // Handle file uploads (check if file exists, then assign filename)
      if (req.files["licenseFile"]) {
        updatedData.licenseFile = req.files["licenseFile"][0].filename;
      }
      if (req.files["aadhaarCard"]) {
        updatedData.aadhaarCard = req.files["aadhaarCard"][0].filename;
      }
      if (req.files["panCard"]) {
        updatedData.panCard = req.files["panCard"][0].filename;
      }

      // Perform update operation
      const updatedDriver = await Driver.findByIdAndUpdate(req.params.id, updatedData, { new: true });

      if (!updatedDriver) {
        return res.json({code:0, message: "Driver not found" });
      }

      res.json({ code: 1, message: "Driver updated successfully", driver: updatedDriver });

    } catch (error) {
      res.json({ code: 0, message: "Server error", error: error.message });
    }
  }
);


// ✅ Delete Driver
router.delete("/DriverDelete/:id", VerifyToken, async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) return res.json({ code:0,message: "Driver not found" });

    // Delete associated files if they exist
    const deleteFileIfExists = (fileName) => {
      if (fileName) {
        const filePath = path.join(__dirname, "../uploads", fileName);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    };

    deleteFileIfExists(driver.licenseFile);
    deleteFileIfExists(driver.aadhaarCard);
    deleteFileIfExists(driver.panCard);

    // Delete driver from DB
    await Driver.findByIdAndDelete(req.params.id);

    res.json({ code:1,message: "Driver and files deleted successfully" });
  } catch (error) {
    res.json({code:0, message: "Server error", error: error.message });
  }
});

router.put("/assign-vehicle/:id", VerifyToken, async (req, res) => {
  try {
    const { vehicleId } = req.body;
    const driverId = req.params.id;

    // Check if vehicleId is already assigned to any other driver
    const existingDriver = await Driver.findOne({
      vehicleId: vehicleId,
      _id: { $ne: driverId }, // Not the same driver
    });

    if (existingDriver) {
      return res.json({code:0,
        message: "This vehicle is already assigned to another driver.",
      });
    }

    // If not assigned, update driver
    await Driver.findByIdAndUpdate(driverId, { vehicleId: vehicleId });

    res.json({code:1, message: "Vehicle assigned successfully" });
  } catch (error) {
    console.log(error);
    res.json({code:0, message: "Server error", error: error.message });
  }
});

router.put("/generate-password/:id", VerifyToken, async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) return res.json({code:0, message: "Driver not found" });

    const namePart = driver.driverName.substring(0, 3);
    const mobilePart = driver.driverMobile.slice(-4);
    const rawPassword = `${namePart}@${mobilePart}`;
    const username = driver.driverMobile;

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    await Driver.findByIdAndUpdate(req.params.id, {
      username: username,
      password: hashedPassword,
    });

    res.json({code:1,
      message: "Username & Password Generated Successfully",
      username,
      password: rawPassword,  // Send raw password in response for display
    });

  } catch (error) {
    res.json({code:0, message: "Server error", error: error.message });
  }
});

// Driver Login API
router.post('/DriverLogin', async (req, res) => {
  const { mobile, password } = req.body;

  // Check input
  if (!mobile || !password) {
    return res.status(400).json({ code: 0, message: "Username and password are required." });
  }

  try {
    // Find driver by username
    const driver = await Driver.findOne({ username:mobile, Active: true });

    if (!driver) {
      return res.json({ code: 0, message: "Invalid username or inactive account." });
    }

    // Compare password (if hashed)
    const isMatch = await bcrypt.compare(password, driver.password);

    if (!isMatch) {
      return res.json({ code: 0, message: "Invalid password." });
    }

    // Create JWT Token
    const token = jwt.sign({ id: driver._id, role: "Driver" }, process.env.KEYFORTOKEN, { expiresIn: '1d' });

    // Success Response
    res.json({
      code: 1,
      message: "Login successful",
      token,
      driver: {
        id: driver._id,
        name: driver.driverName,
        username: driver.username,
        mobile: driver.driverMobile,
        vehicleId: driver.vehicleId,
      },
    });

  } catch (error) {
    console.error("Driver login error:", error.message);
    res.json({ code: 0, message: "Server error" });
  }
});

module.exports = router;
