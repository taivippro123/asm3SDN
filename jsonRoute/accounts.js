const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const { isAdmin } = require('../middleware/auth');

// Get all members (admin only)
router.get('/', isAdmin, async (req, res) => {
    try {
        const members = await Member.find().select('-password');
        res.json({ success: true, data: members });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error fetching members' });
    }
});

module.exports = router; 