const AuthService = require("../services/AuthService");
const { validationResult } = require("express-validator");

const register = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  try {
    const user = await AuthService.register(req.body);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  try {
    const result = await AuthService.login(req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login };