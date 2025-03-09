const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true
  },
  provider: {
    type: String,
    required: true, // 'google' or 'local'
  },
  provider_id: {
    type: String,
    required: true,
    unique: true, // Google user ID (ensures no duplicate users)
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensure unique emails across providers
  },
  role: {
    type: String,
    enum: ['admin', 'student', 'staff'],
    default: 'student', // Default role is 'student'
  },
  created_at: {
    type: Date,
    default: Date.now, // Track registration time
  },
});

module.exports = mongoose.model('User', userSchema);
