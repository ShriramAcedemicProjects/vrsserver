const express = require("express");

const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// User Registration
router.post("/registerUser", async (req, res) => {
  try {
    const { firstName, lastName, email, password, role,mobile } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.json({code:0, message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      mobile
    });

    res.json({ code:1,message: "User registered successfully", user: newUser });
  } catch (error) {
    res.json({code:0, message: "Server Error", error });
  }
});

// User Login
router.post("/loginUser", async (req, res) => {
    console.log(req.body)
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.json({ code:0,message: "You are Not Reigistered User" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.json({code:0, message: "Invalid Credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.KEYFORTOKEN, {
      expiresIn: "1d",
    });

    res.json({code:1,message:"Login Successfully", token, user });
  } catch (error) {
    res.json({code:0, message: "Server Error", error });
  }
});

// Get User Profile
router.get("/getUserProfile", authMiddleware , async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select("-password");
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Server Error", error });
    }
  });
  
  // Update User Profile
  router.put("/updateUserProfile/:userId",authMiddleware, async (req, res) => {
    try {
      const { firstName, lastName } = req.body;
  
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: "User not found" });
  
      user.firstName = firstName || user.firstName;
      user.lastName = lastName || user.lastName;
  
      const updatedUser = await user.save();
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Server Error", error });
    }
  });

module.exports = router;