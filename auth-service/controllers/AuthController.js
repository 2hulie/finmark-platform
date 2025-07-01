const AuthService = require("../services/AuthService");

const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    const user = await AuthService.register(req.body);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    const result = await AuthService.login(req.body);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message || "Login failed" });
  }
};

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
    next(err);
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
