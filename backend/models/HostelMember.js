const mongoose = require('mongoose');

const hostelMemberSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // References the User model
    required: true,
  },
  hostel_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'student'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved'],
    default: 'pending',
  },
  joined_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('HostelMember', hostelMemberSchema);
