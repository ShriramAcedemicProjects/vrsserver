require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./db/connect");

const authRoutes = require("./routes/AuthRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const DriverRoutes = require("./routes/DriverRoutes");
const TravelRoute = require("./routes/travelRouteRoutes");
//const userRoutes = require("./routes/userRoutes");
const BookingRoutes=require("./routes/BookingRoutes")

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/authAPI", authRoutes);
app.use("/vehiclesAPI", vehicleRoutes);
app.use("/DriversAPI",DriverRoutes)
app.use("/TravelRoute",TravelRoute)
//app.use("/api/users", userRoutes);
app.use("/BookingAPI",BookingRoutes)

app.use('/uploads', express.static('uploads'));

// Start Server
connectDB();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
