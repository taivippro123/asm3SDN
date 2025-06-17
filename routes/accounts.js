const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const { isAdmin } = require('../middleware/auth');

// Get all members (admin only)
router.get('/', isAdmin, async (req, res) => {
    try {
        const members = await Member.find().select('-password');
        res.render('accounts/index', { members });
    } catch (err) {
        req.flash('error_msg', 'Error fetching members');
        res.redirect('/');
    }
});

module.exports = router; 