const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User"); 
const jwt = require("jsonwebtoken");

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/auth/google/callback",
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    let user = await User.findOne({ where: { email } });

    if (!user) {
      user = await User.create({
        name: profile.displayName,
        email,
        password: "GOOGLE_OAUTH", // placeholder
        role: "user",
      });
    }
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

