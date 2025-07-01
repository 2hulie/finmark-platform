const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendMail } = require("../utils/email");
const crypto = require("crypto");

const register = async ({ name, email, password }) => {
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Please enter a valid email address.");
  }
  const existing = await User.findOne({ where: { email } });
  if (existing) throw new Error("User already exists");

  const hashed = await bcrypt.hash(password, 10);
  // Generate email verification token
  const emailVerificationToken = crypto.randomBytes(32).toString("hex");

  // Use a transaction so user is only created if email sends successfully
  const sequelize = User.sequelize;
  return await sequelize.transaction(async (t) => {
    // Don't create user until email is sent successfully
    const verifyUrl = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/verify-email?token=${emailVerificationToken}`;

    await sendMail({
      to: email,
      subject: "Verify your email address",
      text: `Click the following link to verify your email: ${verifyUrl}`,
      html: `<p>Click the following link to verify your email:</p><a href="${verifyUrl}">${verifyUrl}</a>`,
    });

    // Only create user if email sent
    const user = await User.create(
      {
        name,
        email,
        password: hashed,
        isEmailVerified: false,
        emailVerificationToken,
      },
      { transaction: t }
    );

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      message: "Verification email sent",
    };
  });
};

const login = async ({ email, password }) => {
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Please enter a valid email address.");
  }
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error("User not found");

  if (!user.isEmailVerified) {
    throw new Error("Please verify your email before logging in.");
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Email and password do not match!");

  // Check which 2FA methods are enabled
  const available2FAMethods = [];
  if (user.is2FAAuthenticatorEnabled && user.twoFASecret) {
    available2FAMethods.push("authenticator");
  }
  if (user.is2FAEmailEnabled && user.isEmailVerified) {
    available2FAMethods.push("email");
  }

  if (available2FAMethods.length > 0) {
    return {
      twoFARequired: true,
      available2FAMethods,
      userId: user.id,
      email: user.email,
    };
  }

  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  return { token };
};

const login2FA = async ({ email, code }) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error("User not found");
  if (!user.is2FAAuthenticatorEnabled || !user.twoFASecret)
    throw new Error("Authenticator 2FA not enabled");
  const speakeasy = require("speakeasy");
  const verified = speakeasy.totp.verify({
    secret: user.twoFASecret,
    encoding: "base32",
    token: code,
  });
  if (!verified) throw new Error("Invalid 2FA code");
  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
  return { token };
};

module.exports = { register, login, login2FA };
