const validateEmail = (email) =>
  typeof email === "string" && /^\S+@\S+\.\S+$/.test(email);

const validatePassword = (password) =>
  typeof password === "string" && password.length >= 6;

const validateString = (field, max = 100) =>
  typeof field === "string" && field.trim().length > 0 && field.length <= max;

module.exports = {
  validateEmail,
  validatePassword,
  validateString,
};