const AuthService = require("../services/AuthService");

const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Basic input validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
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

    // Basic input validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const result = await AuthService.login(req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login };