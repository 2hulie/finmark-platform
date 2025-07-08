const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
const jwt = require("jsonwebtoken");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        let user = await User.findOne({ where: { email } });

        if (!user) {
          user = await User.create({
            name: profile.displayName || "user",
            email,
            password: "GOOGLE_OAUTH", // placeholder
            role: "user",
            isEmailVerified: true, // Mark as verified for Google sign-in
          });

          // Optional: Send a welcome email
          try {
            const { sendMail } = require("../utils/email");
            await sendMail({
              to: email,
              subject: "Welcome to Finmark!",
              text: `Hi ${
                profile.displayName || "there"
              },\n\nWelcome to Finmark! You have successfully signed up using your Google account.`,
              html: `<p>Hi ${
                profile.displayName || "there"
              },</p><p>Welcome to <b>Finmark</b>! You have successfully signed up using your Google account.</p>`,
            });
          } catch (e) {
            // Log but do not block login if welcome email fails
            console.error("Failed to send welcome email to Google user:", e);
          }
        } else {
          // If user exists and is not verified, mark as verified
          let updated = false;
          if (!user.isEmailVerified) {
            user.isEmailVerified = true;
            updated = true;
          }
          // Optionally update name if Google name is different
          if (profile.displayName && user.name !== profile.displayName) {
            user.name = profile.displayName;
            updated = true;
          }
          if (updated) {
            await user.save();
          }
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);
