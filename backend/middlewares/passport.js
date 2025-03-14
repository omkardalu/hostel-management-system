const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const dotenv = require('dotenv');
const HostelMember = require('../models/HostelMember');

dotenv.config();

const callbackURL = process.env.NODE_ENV === 'production'
  ? 'https://hostel-management-system-3rr9.onrender.com/api/auth/google/callback'
  : 'http://localhost:3000/api/auth/google/callback';

module.exports = (passport) => {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: callbackURL,
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log("Google Profile Data:", profile);

      // Extract profile picture (use _json for a safer reference)
      const profilePicture = profile._json?.picture || profile.photos?.[0]?.value || 'default-avatar.png';

      let user = await User.findOne({ provider_id: profile.id });

      if (!user) {
        // Create a new user if not found
        user = new User({
          googleId: profile.id,
          provider: 'google',
          provider_id: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          profilePicture,
          role: 'student',
        });
        await user.save();
      }

      // Generate JWT with profile picture

      const token = jwt.sign({
        userId: user._id,
        profilePicture: user.profilePicture,
        hostels: await HostelMember.find({ user_id: user._id }).select('hostel_id role'),
      }, process.env.JWT_SECRET, { expiresIn: '1d' });

      console.log('✅ JWT Payload:', {
        userId: user._id,
        profilePicture: user.profilePicture,
        hostels: await HostelMember.find({ user_id: user._id }).select('hostel_id role'),
      });
      console.log("Generated JWT:", token);

      return done(null, { user, token });
    } catch (error) {
      console.error("OAuth Error:", error);
      return done(error, null);
    }
  }));

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((obj, done) => {
    done(null, obj);
  });
};
