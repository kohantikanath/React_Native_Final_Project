// backend/models/Expense.js
const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    wallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
      required: false, // Optional for now so old data doesn't break
    },
    amount: {
      type: Number,
      required: true,
    },
    // ... keep category, type, description, date, localId, paymentMethod ...
    category: { type: String, required: true },
    type: { type: String, enum: ["Income", "Expense"], default: "Expense" },
    paymentMethod: { type: String, default: "Cash" },
    description: { type: String, default: "" },
    date: { type: Date, default: Date.now },
    localId: { type: String },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Expense", expenseSchema);
