const AuthService = require("../services/AuthService");
const {
  validateEmail,
  validatePassword,
  validateString,
} = require("../utils/validators");

// Register
const register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    
    // Basic input validation
    if (!validateString(name, 50)) {
      return res.status(400).json({ message: "Name is required." });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: "A valid email is required." });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    const user = await AuthService.register({ name, email, password, confirmPassword });
    res.status(201).json(user);
  } catch (err) {
    const status = err.statusCode || 500;
    res.status(status).json({ message: err.message || "Something went wrong" });
  }
};

// Login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Enter a valid email." });
    }
    if (!validatePassword(password)) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const result = await AuthService.login({ email, password });
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message || "Login failed" });
  }
};

// 2FA Login
const login2FA = async (req, res, next) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res
        .status(400)
        .json({ message: "Email and 2FA code are required" });
    }
    const result = await AuthService.login2FA(req.body);
    res.status(200).json(result);
  } catch (err) {
    const status = err.statusCode || 500;
    res.status(status).json({ message: err.message || "2FA login failed" });
  }
};

// Helper to generate JWT token for a user
function generateToken(user) {
  const jwt = require("jsonwebtoken");
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
}

module.exports = { register, login, login2FA, generateToken };
