const express = require("express");
const mongoose = require("mongoose");
const Expense = require("../models/Expense");
const auth = require("../middleware/auth");
const router = express.Router();

// ==========================================
// 1. PLACE STATS ROUTES AT THE VERY TOP!
// ==========================================

// Get Insights (Must be first!)
router.get("/stats/insights", auth, async (req, res) => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentStart = new Date(currentYear, currentMonth, 1);
    const currentEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
    const lastStart = new Date(lastMonthYear, lastMonth, 1);
    const lastEnd = new Date(lastMonthYear, lastMonth + 1, 0, 23, 59, 59);

    const userObjectId = new mongoose.Types.ObjectId(req.userId);

    const currentMonthData = await Expense.aggregate([
      {
        $match: {
          user: userObjectId,
          date: { $gte: currentStart, $lte: currentEnd },
          type: "Expense",
        },
      },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
    ]);

    const lastMonthData = await Expense.aggregate([
      {
        $match: {
          user: userObjectId,
          date: { $gte: lastStart, $lte: lastEnd },
          type: "Expense",
        },
      },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
    ]);

    const lastMonthMap = {};
    lastMonthData.forEach((item) => {
      lastMonthMap[item._id] = item.total;
    });

    const insights = [];
    let currentTotal = 0;
    let lastTotal = 0;

    currentMonthData.forEach((item) => {
      currentTotal += item.total;
      const lastAmount = lastMonthMap[item._id] || 0;
      lastTotal += lastAmount;

      if (lastAmount > 0) {
        const change = ((item.total - lastAmount) / lastAmount) * 100;
        if (Math.abs(change) >= 10) {
          insights.push({
            category: item._id,
            message:
              change > 0
                ? `You spent ${Math.round(change)}% more on ${
                    item._id
                  } this month`
                : `You spent ${Math.abs(Math.round(change))}% less on ${
                    item._id
                  } this month`,
          });
        }
      }
    });

    const overallChange =
      lastTotal > 0 ? ((currentTotal - lastTotal) / lastTotal) * 100 : 0;

    res.json({
      insights,
      currentMonthTotal: currentTotal,
      lastMonthTotal: lastTotal,
      overallChange: Math.round(overallChange),
    });
  } catch (error) {
    console.error("Insight Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get Daily Stats
router.get("/stats/daily", auth, async (req, res) => {
  // ... (Your existing daily code)
  res.json({ message: "Daily stats placeholder" });
});

// ==========================================
// 2. STANDARD CRUD ROUTES (Below Stats)
// ==========================================

// Add Expense
router.post("/", auth, async (req, res) => {
  // ... (Your existing add code)
  try {
    const {
      amount,
      category,
      paymentMethod,
      description,
      date,
      localId,
      type,
      wallet,
    } = req.body;
    const expense = new Expense({
      user: req.userId,
      amount,
      category,
      paymentMethod,
      description,
      date: date || new Date(),
      localId,
      type: type || "Expense",
      wallet: wallet || null,
    });
    await expense.save();
    res.status(201).json({ message: "Expense added", expense });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get All Expenses
router.get("/", auth, async (req, res) => {
  // ... (Your existing get all code)
  try {
    const expenses = await Expense.find({ user: req.userId }).sort({
      date: -1,
    });
    res.json({ expenses });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ==========================================
// 3. DYNAMIC ID ROUTES (MUST BE LAST!)
// ==========================================

// Get By ID
router.get("/:id", auth, async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.userId,
    });
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json({ expense });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update By ID
router.put("/:id", auth, async (req, res) => {
  // ... (Your update logic)
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true }
    );
    res.json({ expense });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete By ID
router.delete("/:id", auth, async (req, res) => {
  // ... (Your delete logic)
  try {
    await Expense.findOneAndDelete({ _id: req.params.id, user: req.userId });
    res.json({ message: "Expense deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
