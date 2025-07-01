const express = require("express");
const router = express.Router();
const crypto = require("crypto");
// Resend verification email endpoint
router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required." });
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: "User not found." });
    if (user.isEmailVerified) {
      return res.status(400).json({ message: "Email is already verified." });
    }
    // Generate new verification token
    const emailVerificationToken = crypto.randomBytes(32).toString("hex");
    user.emailVerificationToken = emailVerificationToken;
    await user.save();
    // Send verification email
    const { sendMail } = require("../utils/email");
    const verifyUrl = `${
      process.env.FRONTEND_URL || "http://localhost:3001"
    }/verify-email?token=${emailVerificationToken}`;
    await sendMail({
      to: user.email,
      subject: "Verify your email",
      text: `Click the following link to verify your email: ${verifyUrl}`,
      html: `<p>Click <a href="${verifyUrl}">here</a> to verify your email.</p>`,
    });
    res.json({ success: true, message: "Verification email resent." });
  } catch (err) {
    res.status(500).json({ message: "Failed to resend verification email." });
  }
});
const { register, login, login2FA } = require("../controllers/AuthController");
const validateToken = require("../middleware/validateToken");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const User = require("../models/User");

// 2FA via email: send code (for login, public, takes email in body)
// Updated: 2FA via email: send code (for login, public, takes email in body)
router.post("/2fa/email/send", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required." });
    const user = await User.findOne({ where: { email } });
    if (!user || !user.is2FAEmailEnabled) {
      return res
        .status(400)
        .json({ message: "2FA email login not available." });
    }
    if (!user.isEmailVerified) {
      return res.status(400).json({ message: "Email not verified." });
    }
    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.twoFAEmailCode = code;
    user.twoFAEmailCodeSentAt = new Date();
    await user.save();
    const { sendMail } = require("../utils/email");
    await sendMail({
      to: user.email,
      subject: "Your 2FA Code",
      text: `Your 2FA code is: ${code}`,
      html: `<p>Your 2FA code is: <b>${code}</b></p>`,
    });
    res.json({ success: true, message: "2FA code sent to email." });
  } catch (err) {
    res.status(500).json({ message: "Failed to send 2FA code." });
  }
});

// 2FA via email: check if user can use email 2FA (for frontend UI convenience)
router.get("/2fa/email/available", validateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    res.json({
      isEmailVerified: user.isEmailVerified,
      email: user.email,
      canUseEmail2FA: !!user.isEmailVerified,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to check email 2FA availability." });
  }
});
// 2FA via email: verify code (for setup and login)
// Updated: 2FA via email: verify code (for setup and login)
router.post("/2fa/email/verify", validateToken, async (req, res) => {
  try {
    const { code } = req.body;
    const user = await User.findByPk(req.user.id);
    const now = new Date();
    const sentAt = user.twoFAEmailCodeSentAt;
    // Debug logging
    console.log("[2FA VERIFY] code from user:", code);
    console.log("[2FA VERIFY] code in db:", user.twoFAEmailCode);
    console.log(
      "[2FA VERIFY] sentAt:",
      sentAt,
      "now:",
      now,
      "diff(ms):",
      sentAt ? now - sentAt : null
    );
    const isValid =
      user.twoFAEmailCode === code && sentAt && now - sentAt <= 60 * 1000; // 1 minute validity
    if (isValid) {
      user.is2FAEmailEnabled = true;
      user.twoFAEmailCode = null;
      user.twoFAEmailCodeSentAt = null;
      await user.save();
      res.json({ success: true });
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid or expired 2FA code",
        debug: {
          codeFromUser: code,
          codeInDb: user.twoFAEmailCode,
          sentAt,
          now,
          diffMs: sentAt ? now - sentAt : null,
        },
      });
    }
  } catch (err) {
    res.status(500).json({ message: "2FA email verification failed" });
  }
});

// 2FA via email: login (for users who have email 2FA enabled)
// Updated: 2FA via email: login (for users who have email 2FA enabled)
router.post("/2fa/email/login", async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || !user.is2FAEmailEnabled) {
      return res
        .status(400)
        .json({ message: "2FA email login not available." });
    }
    const now = new Date();
    const sentAt = user.twoFAEmailCodeSentAt;
    const isValid =
      user.twoFAEmailCode === code && sentAt && now - sentAt <= 60 * 1000; // 1 minute validity
    if (isValid) {
      user.twoFAEmailCode = null;
      user.twoFAEmailCodeSentAt = null;
      await user.save();
      // Issue JWT (reuse login2FA logic if needed)
      const { generateToken } = require("../controllers/AuthController");
      const token = generateToken(user);
      res.json({ success: true, token });
    } else {
      res
        .status(400)
        .json({ success: false, message: "Invalid or expired 2FA code" });
    }
  } catch (err) {
    res.status(500).json({ message: "2FA email login failed" });
  }
});
// Email verification endpoint
router.get("/verify-email", async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ message: "Missing token" });
  const user = await User.findOne({ where: { emailVerificationToken: token } });
  if (!user)
    return res.status(400).json({ message: "Invalid or expired token" });
  user.isEmailVerified = true;
  user.emailVerificationToken = null;
  await user.save();
  res.json({ success: true, message: "Email verified!" });
});

router.post("/register", register);
router.post("/login", login);
// 2FA login endpoint
router.post("/2fa/login", login2FA);

// 🔐 Protected route
router.get("/me", validateToken, (req, res) => {
  res.status(200).json({ message: "Authenticated user", user: req.user });
});

// 2FA Setup: Enable authenticator or email 2FA independently
router.post("/2fa/setup", validateToken, async (req, res) => {
  try {
    const { method } = req.body;
    const user = await User.findByPk(req.user.id);
    if (method === "email") {
      if (user.is2FAEmailEnabled) {
        return res
          .status(400)
          .json({ message: "Email 2FA is already enabled." });
      }
      if (!user.isEmailVerified) {
        return res.status(400).json({ message: "Email not verified." });
      }
      // Generate and send code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      user.twoFAEmailCode = code;
      user.twoFAEmailCodeSentAt = new Date();
      await user.save();
      const { sendMail } = require("../utils/email");
      await sendMail({
        to: user.email,
        subject: "Your 2FA Setup Code",
        text: `Your 2FA setup code is: ${code}`,
        html: `<p>Your 2FA setup code is: <b>${code}</b></p>`,
      });
      return res.json({
        method: "email",
        message: "2FA setup code sent to email.",
      });
    } else if (method === "authenticator") {
      if (user.is2FAAuthenticatorEnabled) {
        return res
          .status(400)
          .json({ message: "Authenticator 2FA is already enabled." });
      }
      const secret = speakeasy.generateSecret({ name: "FinMark" });
      user.twoFASecret = secret.base32;
      await user.save();
      const qr = await QRCode.toDataURL(secret.otpauth_url);
      return res.json({ method: "authenticator", qr, secret: secret.base32 });
    } else {
      return res.status(400).json({ message: "Invalid 2FA method." });
    }
  } catch (err) {
    res.status(500).json({ message: err.message || "2FA setup failed" });
  }
});
// 2FA Disable endpoint (disable each method independently)
router.post("/2fa/disable", validateToken, async (req, res) => {
  try {
    const { method } = req.body;
    const user = await User.findByPk(req.user.id);
    if (method === "email") {
      if (!user.is2FAEmailEnabled) {
        return res.status(400).json({ message: "Email 2FA is not enabled." });
      }
      user.is2FAEmailEnabled = false;
      user.twoFAEmailCode = null;
      await user.save();
      return res.json({ success: true, message: "Email 2FA disabled." });
    } else if (method === "authenticator") {
      if (!user.is2FAAuthenticatorEnabled) {
        return res
          .status(400)
          .json({ message: "Authenticator 2FA is not enabled." });
      }
      user.is2FAAuthenticatorEnabled = false;
      user.twoFASecret = null;
      await user.save();
      return res.json({
        success: true,
        message: "Authenticator 2FA disabled.",
      });
    } else {
      return res.status(400).json({ message: "Invalid 2FA method." });
    }
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to disable 2FA." });
  }
});

// Updated: 2FA Verify: User submits code from authenticator app
router.post("/2fa/verify", validateToken, async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user.twoFASecret) {
      return res
        .status(400)
        .json({ success: false, message: "2FA not set up for this user." });
    }
    const verified = speakeasy.totp.verify({
      secret: user.twoFASecret,
      encoding: "base32",
      token,
    });
    if (verified) {
      user.is2FAAuthenticatorEnabled = true;
      await user.save();
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, message: "Invalid 2FA token" });
    }
  } catch (err) {
    res.status(500).json({ message: "2FA verification failed" });
  }
});
// 2FA status endpoint: returns both 2FA flags for frontend
router.get("/2fa/status", validateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    res.json({
      is2FAEmailEnabled: !!user.is2FAEmailEnabled,
      is2FAAuthenticatorEnabled: !!user.is2FAAuthenticatorEnabled,
      isEmailVerified: !!user.isEmailVerified,
      email: user.email,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to get 2FA status." });
  }
});

module.exports = router;
