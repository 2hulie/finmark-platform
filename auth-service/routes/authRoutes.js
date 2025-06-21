const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/AuthController");
const validateToken = require("../middleware/validateToken");

// Register Route
router.post("/register",
  [
    body("email").isEmail().withMessage("A valid email is required"),
    body("name").notEmpty().withMessage("Name is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  register);

// Login Route
router.post("/login",
  [
    body("email").isEmail().withMessage("A valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  login);

// 🔐 Protected route
router.get("/me", validateToken, (req, res) => {
  res.status(200).json({ message: "Authenticated user", user: req.user });
});

module.exports = router;