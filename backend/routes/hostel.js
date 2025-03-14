const express = require('express');
const router = express.Router();
const Hostel = require('../models/Hostel');
const HostelMember = require('../models/HostelMember');
const { authenticateUser } = require('../middlewares/auth');

router.get('/my-hostels', authenticateUser, async (req, res) => {
  try {
    // Find all approved hostels where the user is a member
    const userHostels = await HostelMember.find({
      user_id: req.user.userId,
      status: 'approved',
    }).populate({
      path: 'hostel_id', // Populate hostel details
      select: 'name address created_by', // Select required fields
    });

    if (!userHostels.length) {
      return res.status(404).send('❌ You are not part of any hostels.');
    }

    // Extract detailed hostel information
    const hostels = userHostels.map((member) => ({
      hostel_id: member.hostel_id._id,
      name: member.hostel_id.name,
      address: member.hostel_id.address,
      created_by: member.hostel_id.created_by,
      role: member.role,
      joined_at: member.joined_at,
    }));

    res.status(200).json({
      message: '✅ Hostels retrieved successfully.',
      hostels,
    });
  } catch (error) {
    console.error('❌ Error listing hostels:', error);
    res.status(500).send('❌ Internal server error.');
  }
});

router.get('/join/:hostel_id', authenticateUser, async (req, res) => {
  try {
    const { hostel_id } = req.params;

    const hostel = await Hostel.findById(hostel_id);
    if (!hostel) {
      return res.status(404).send('❌ Hostel not found.');
    }

    const existingMember = await HostelMember.findOne({
      user_id: req.user.userId,
      hostel_id,
    });

    if (existingMember) {
      return res.status(409).send('❌ You already requested or joined this hostel.');
    }

    // Create a pending membership request
    await HostelMember.create({
      user_id: req.user.userId,
      hostel_id,
      role: 'student',
      status: 'pending',
      joined_at: new Date(),
    });

    res.status(201).send(`✅ Request to join ${hostel.name} sent successfully.`);
  } catch (error) {
    console.error('Error joining hostel:', error);
    res.status(500).send('❌ Internal server error.');
  }
});

// 📌 Create a Hostel (Admin Only, Now Supports GET)
router.get('/create', authenticateUser, async (req, res) => {
  try {
    const { name, address } = req.query;

    if (!name || !address) {
      return res.status(400).send('❌ Name and address are required.');
    }

    // Check if the hostel already exists
    const existingHostel = await Hostel.findOne({ name });
    if (existingHostel) {
      return res.status(409).send('❌ Hostel already exists.');
    }

    // Create the hostel
    const newHostel = await Hostel.create({
      name,
      address,
      created_by: req.user.userId,
    });

    // Automatically make the creator an admin
    await HostelMember.create({
      user_id: req.user.userId,
      hostel_id: newHostel._id,
      role: 'admin',
      status: 'approved',
      joined_at: new Date(),
    });

    res.status(201).send(`✅ Hostel "${name}" created successfully! You are now an admin.`);
  } catch (error) {
    console.error('❌ Error creating hostel:', error);
    res.status(500).send('❌ Internal server error.');
  }
});


module.exports = router;
