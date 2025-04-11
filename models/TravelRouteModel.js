const mongoose = require("mongoose");

const travelRouteSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    kilometer: {
      type: Number,
      required: true,
    },
    autoIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vehicle",
        required: true,
      },
    ],
    carIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vehicle",
        required: true,
      },
    ],
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
  },
  
);

module.exports = mongoose.model("TravelRoute", travelRouteSchema, "TravelRoute");
