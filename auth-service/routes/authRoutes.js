const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/AuthController");
const validateToken = require("../middleware/validateToken");

router.post("/register", register);
router.post("/login", login);

// 🔐 Protected route
router.get("/me", validateToken, (req, res) => {
  res.status(200).json({ message: "Authenticated user", user: req.user });
});

module.exports = router;