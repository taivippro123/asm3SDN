const express = require('express');
const router = express.Router();
const passport = require('passport');
const Member = require('../models/Member');
const { isAuthenticated } = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
    const { membername, password, name, YOB } = req.body;
    try {
        const memberExists = await Member.findOne({ membername });
        if (memberExists) {
            return res.status(400).json({ success: false, message: 'Membername already exists' });
        }
        const newMember = new Member({
            membername,
            password,
            name,
            YOB,
            isAdmin: false
        });
        await newMember.save();
        res.status(201).json({ success: true, message: 'Registered successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error in registration' });
    }
});

// Login
router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return res.status(500).json({ success: false, message: 'Server error' });
        if (!user) return res.status(400).json({ success: false, message: info?.message || 'Invalid credentials' });
        req.logIn(user, (err) => {
            if (err) return res.status(500).json({ success: false, message: 'Login failed' });

            res.json({ success: true, message: 'Logged in successfully', user: { _id: user._id, membername: user.membername, name: user.name, YOB: user.YOB, isAdmin: user.isAdmin } });
        });
    })(req, res, next);
});

// Logout
router.post('/logout', (req, res) => {
    req.logout((err) => {
        if (err) return res.status(500).json({ success: false, message: 'Logout failed' });
        res.json({ success: true, message: 'Logged out successfully' });
    });
});

// Get profile
router.get('/profile', isAuthenticated, (req, res) => {
    res.json({ success: true, data: { _id: req.user._id, membername: req.user.membername, name: req.user.name, YOB: req.user.YOB, isAdmin: req.user.isAdmin } });
});

// Update profile
router.post('/profile', isAuthenticated, async (req, res) => {
    try {
        const { name, YOB } = req.body;
        await Member.findByIdAndUpdate(req.user._id, { name, YOB });
        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error updating profile' });
    }
});

// Change password
router.post('/change-password', isAuthenticated, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const member = await Member.findById(req.user._id);
        const isMatch = await member.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        }
        member.password = newPassword;
        await member.save();
        res.json({ success: true, message: 'Password changed successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error changing password' });
    }
});

router.get('/google', passport.authenticate('google-react', { scope: ['profile', 'email'] }));

// Google OAuth callback
router.get(
    '/google/callback',
    passport.authenticate('google-react', {
        failureRedirect: 'http://localhost:5173/login?error=google-failed', // Khi lỗi, redirect về trang login của ReactJS
        failureFlash: true,
    }),
    (req, res) => {
        // Khi thành công, redirect về một trang callback ở ReactJS
        res.redirect('http://localhost:5173/auth/google/callback');
    }
);

module.exports = router; 