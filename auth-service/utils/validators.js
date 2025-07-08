const validateEmail = (email) =>
  typeof email === "string" && /^\S+@\S+\.\S+$/.test(email);

const validatePassword = (password) =>
  typeof password === "string" &&
  password.length >= 8 &&
  /[A-Z]/.test(password) &&
  /[a-z]/.test(password) &&
  /[0-9]/.test(password) &&
  /[^A-Za-z0-9]/.test(password);

const validateString = (field, max = 100) =>
  typeof field === "string" && field.trim().length > 0 && field.length <= max;

module.exports = {
  validateEmail,
  validatePassword,
  validateString,
};
