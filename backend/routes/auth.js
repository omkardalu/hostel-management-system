const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();
const router = express.Router();

// JWT verification middleware
const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: 'Unauthorized: No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    req.user = decoded;
    next();
  });
};

// Initiate Google OAuth login
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
}));

router.get('/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
  try {
    const { user, token } = req.user;

    const refreshToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, // 🔹 Secure, not accessible by JavaScript
      secure: process.env.NODE_ENV === 'production', // 🔹 Works only on HTTPS in production
      sameSite: 'Strict', // 🔹 Prevents CSRF attacks
      maxAge: 7 * 24 * 60 * 60 * 1000, // 🔹 7 days
    });

    const redirectUrl = `${process.env.FRONTEND_URL}/dashboard?token=${token}`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('OAuth Callback Error:', error);
    res.status(500).json({ message: 'OAuth callback error', error: error.message });
  }
});

router.get('/user/profile', verifyToken, (req, res) => {
  try {
    const { userId, role, profilePicture } = req.user;
    res.status(200).json({ message: 'User profile fetched', user: { userId, role, profilePicture } });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

router.get('/refresh', (req, res) => {
  const refreshToken = req.cookies?.refreshToken; 

  if (!refreshToken) {
    return res.status(401).json({ message: '❌ Unauthorized: No refresh token', forceLogout: true });
  }

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: '❌ Refresh token expired', forceLogout: true });
    }

    // ✅ Generate new access token
    const newAccessToken = jwt.sign(
      { userId: decoded.userId, role: decoded.role, profilePicture: decoded.profilePicture },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({ message: '✅ Token refreshed', accessToken: newAccessToken });
  });
});



router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logout successful' });
});

module.exports = router;
