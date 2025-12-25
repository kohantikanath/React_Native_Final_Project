// backend/routes/wallets.js
const express = require("express");
const Wallet = require("../models/Wallet");
const Expense = require("../models/Expense"); // We need this to calculate totals
const auth = require("../middleware/auth");
const router = express.Router();

// 1. Create a Wallet (Folder)
router.post("/", auth, async (req, res) => {
  try {
    const { name, icon, color, initialBalance } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Wallet name is required" });
    }

    const wallet = new Wallet({
      user: req.userId,
      name,
      icon: icon || "wallet",
      color: color || "#D0FD3E",
      initialBalance: initialBalance || 0,
    });

    await wallet.save();
    res.status(201).json({ message: "Wallet created", wallet });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 2. Get All Wallets (with calculated balance!)
router.get("/", auth, async (req, res) => {
  try {
    const wallets = await Wallet.find({ user: req.userId }).sort({
      createdAt: -1,
    });

    // We need to calculate the current balance for each wallet
    // Balance = Initial + (All Income inside this wallet) - (All Expense inside this wallet)

    const walletData = await Promise.all(
      wallets.map(async (wallet) => {
        const expenses = await Expense.find({
          user: req.userId,
          wallet: wallet._id,
        });

        let currentBalance = wallet.initialBalance;

        expenses.forEach((exp) => {
          if (exp.type === "Income") {
            currentBalance += exp.amount;
          } else {
            currentBalance -= exp.amount;
          }
        });

        return {
          ...wallet.toObject(),
          currentBalance,
        };
      })
    );

    res.json({ wallets: walletData });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 3. Delete Wallet
router.delete("/:id", auth, async (req, res) => {
  try {
    await Wallet.findOneAndDelete({ _id: req.params.id, user: req.userId });
    // Optional: Delete all expenses inside this wallet?
    // For safety, let's keep them but unlink them.
    await Expense.updateMany(
      { wallet: req.params.id },
      { $unset: { wallet: "" } }
    );
    res.json({ message: "Wallet deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
