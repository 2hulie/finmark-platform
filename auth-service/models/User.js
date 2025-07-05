const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define("User", {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: "user",
  },
  // 2FA fields
  is2FAEmailEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  is2FAAuthenticatorEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  twoFASecret: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  twoFAMethod: {
    type: DataTypes.STRING, // 'authenticator' or 'email'
    allowNull: true,
  },
  twoFAEmailCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  twoFAEmailCodeSentAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  isEmailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  emailVerificationToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = User;
