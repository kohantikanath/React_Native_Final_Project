// backend/models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  currency: {
    type: String,
    default: "USD",
  },
  monthlyLimit: { 
    type: Number, default: 0 
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return; // <--- Just return, don't call next()
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// compare password method
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
