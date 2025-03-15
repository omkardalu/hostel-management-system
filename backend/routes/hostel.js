const express = require('express');
const router = express.Router();
const Hostel = require('../models/Hostel');
const HostelMember = require('../models/HostelMember');
const { authenticateUser } = require('../middlewares/auth');
const User = require('../models/User');

router.get('/all', async (req, res) => {
  try {
    // Find all hostels
    const hostels = await Hostel.find().lean();

    if (!hostels.length) {
      return res.status(404).json({ message: "❌ No hostels found." });
    }

    // Fetch total members and admin names
    const formattedHostels = await Promise.all(
      hostels.map(async (hostel) => {
        const totalMembers = await HostelMember.countDocuments({ hostel_id: hostel._id });
        const admin = await User.findById(hostel.created_by).select('name');

        return {
          hostelId: hostel._id,
          name: hostel.name,
          address: hostel.address,
          totalMembers,
          adminName: admin ? admin.name : "Unknown",
        };
      })
    );

    res.status(200).json({
      message: "✅ Hostels retrieved successfully.",
      hostels: formattedHostels,
    });
  } catch (error) {
    console.error("❌ Error fetching hostels:", error);
    res.status(500).json({ message: "❌ Internal server error." });
  }
});

router.patch('/manage-request/:member_id/:action', authenticateUser, async (req, res) => {
  try {
    const { member_id, action } = req.params;

    const memberRequest = await HostelMember.findById(member_id).populate('hostel_id');

    if (!memberRequest) {
      return res.status(404).send('❌ Join request not found.');
    }

    // Ensure only the hostel admin can approve/reject
    const isAdmin = await HostelMember.findOne({
      user_id: req.user.userId,
      hostel_id: memberRequest.hostel_id._id,
      role: 'admin',
    });

    if (!isAdmin) {
      return res.status(403).send('❌ Only admins can approve/reject requests.');
    }

    // Approve or Reject based on action
    if (action === 'approve') {
      memberRequest.status = 'approved';
      await memberRequest.save();
      return res.status(200).send(`✅ Request approved for ${memberRequest.user_id}`);
    } else if (action === 'reject') {
      await HostelMember.findByIdAndDelete(member_id);
      return res.status(200).send(`❌ Request rejected and removed.`);
    } else {
      return res.status(400).send('❌ Invalid action. Use "approve" or "reject".');
    }
  } catch (error) {
    console.error('❌ Error managing request:', error);
    res.status(500).send('❌ Internal server error.');
  }
});

router.get('/my-hostels', authenticateUser, async (req, res) => {
  try {
    // Find all approved hostels where the user is a member
    const userHostels = await HostelMember.find({
      user_id: req.user.userId,
      status: 'approved',
    }).populate({
      path: 'hostel_id',
      select: 'name address created_by',
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
