// backend/models/Expense.js
const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Food",
        "Transport",
        "Shopping",
        "Entertainment",
        "Bills",
        "Health",
        "Education",
        "Other",
      ],
    },
    type: {
      type: String,
      enum: ["Income", "Expense"],
      default: "Expense",
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: [
        "Cash",
        "Credit Card",
        "Debit Card",
        "UPI",
        "Net Banking",
        "Other",
      ],
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    date: {
      type: Date,
      default: Date.now,
    },
    syncStatus: {
      type: String,
      enum: ["synced", "pending"],
      default: "synced",
    },
    localId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// index for faster queries
expenseSchema.index({ user: 1, date: -1 });
expenseSchema.index({ user: 1, category: 1 });

module.exports = mongoose.model("Expense", expenseSchema);
