const express = require("express");
const cors = require("cors");
require("dotenv").config();
const sequelize = require("./config/db");
const User = require("./models/User"); // ensure model is loaded
const authRoutes = require("./routes/authRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => res.send("Auth Service Running"));

sequelize.sync().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
  });
}).catch((err) => {
  console.error("DB connection error:", err);
});