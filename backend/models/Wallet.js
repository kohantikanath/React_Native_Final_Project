// backend/models/Wallet.js
const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    icon: {
      type: String, // We will store the icon name (e.g., "wallet", "card", "airplane")
      default: "wallet",
    },
    color: {
      type: String, // Store hex color (e.g., "#FF5733")
      default: "#D0FD3E",
    },
    initialBalance: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Wallet", walletSchema);
