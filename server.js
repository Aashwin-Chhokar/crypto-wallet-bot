require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");

const app = express();
app.use(express.json());

connectDB();

app.get("/", (req, res) => {
  res.send("Crypto Wallet Bot Running");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
