const mongoose = require("mongoose");

const txSchema = new mongoose.Schema({
  txHash: { type: String, unique: true },
  to: String,
  amount: Number,
  confirmed: { type: Boolean, default: false },
  blockNumber: Number,
  discordId: String
});

module.exports = mongoose.model("Transaction", txSchema);