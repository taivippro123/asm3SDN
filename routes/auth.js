const express = require('express');
const router = express.Router();
const passport = require('passport');
const Member = require('../models/Member');
const { isAuthenticated } = require('../middleware/auth');

// Register Page
router.get('/register', (req, res) => {
    res.render('auth/register');
});

// Register Handle
router.post('/register', async (req, res) => {
    const { membername, password, name, YOB } = req.body;
    
    try {
        const memberExists = await Member.findOne({ membername });
        if (memberExists) {
            req.flash('error_msg', 'Membername already exists');
            return res.redirect('/auth/register');
        }

        const newMember = new Member({
            membername,
            password,
            name,
            YOB,
            isAdmin: false
        });

        await newMember.save();
        req.flash('success_msg', 'You are now registered and can log in');
        res.redirect('/auth/login');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error in registration');
        res.redirect('/auth/register');
    }
});

// Login Page
router.get('/login', (req, res) => {
    res.render('auth/login');
});

// Login Handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/auth/login',
        failureFlash: true
    })(req, res, next);
});

// Logout Handle
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash('success_msg', 'You are logged out');
        res.redirect('/auth/login');
    });
});

// Profile Page
router.get('/profile', isAuthenticated, (req, res) => {
    res.render('auth/profile', {
        user: req.user
    });
});

// Update Profile
router.post('/profile', isAuthenticated, async (req, res) => {
    try {
        const { name, YOB } = req.body;
        await Member.findByIdAndUpdate(req.user._id, { name, YOB });
        req.flash('success_msg', 'Profile updated successfully');
        res.redirect('/auth/profile');
    } catch (err) {
        req.flash('error_msg', 'Error updating profile');
        res.redirect('/auth/profile');
    }
});

// Change Password
router.post('/change-password', isAuthenticated, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const member = await Member.findById(req.user._id);
        
        const isMatch = await member.comparePassword(currentPassword);
        if (!isMatch) {
            req.flash('error_msg', 'Current password is incorrect');
            return res.redirect('/auth/profile');
        }

        member.password = newPassword;
        await member.save();
        
        req.flash('success_msg', 'Password changed successfully');
        res.redirect('/auth/profile');
    } catch (err) {
        req.flash('error_msg', 'Error changing password');
        res.redirect('/auth/profile');
    }
});

// Google OAuth login
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/auth/login', failureFlash: true }),
  (req, res) => {
    res.redirect('/');
  }
);

module.exports = router; 