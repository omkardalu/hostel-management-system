const dotenv = require('dotenv');
const express = require('express');
const passport = require('../middlewares/passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

dotenv.config();

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
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback
router.get('/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
  try {
    const payload = {
      userId: req.user.id,
      role: req.user.role || 'student',
      provider: 'google'
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict'
    });

    const redirectUrl = `${process.env.FRONTEND_URL}/dashboard?token=${token}`;
    res.redirect(redirectUrl);
  } catch (error) {
    res.status(500).json({ message: 'OAuth callback error', error: error.message });
  }
});

// Protected route: Get user profile
router.get('/user/profile', verifyToken, (req, res) => {
  try {
    const { userId, role } = req.user;
    res.status(200).json({ message: 'User profile fetched', user: { userId, role } });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logout successful' });
});

module.exports = router;
