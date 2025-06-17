const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const { isAdmin } = require('../middleware/auth');

// Get all teams (public)
router.get('/', async (req, res) => {
    try {
        const teams = await Team.find();
        res.render('teams/index', { teams });
    } catch (err) {
        req.flash('error_msg', 'Error fetching teams');
        res.redirect('/');
    }
});

// Get single team (public)
router.get('/:id', async (req, res) => {
    try {
        const team = await Team.findById(req.params.id);
        if (!team) {
            req.flash('error_msg', 'Team not found');
            return res.redirect('/teams');
        }
        res.render('teams/show', { team });
    } catch (err) {
        req.flash('error_msg', 'Error fetching team');
        res.redirect('/teams');
    }
});

// Create team (admin only)
router.post('/', isAdmin, async (req, res) => {
    try {
        const { teamName } = req.body;
        const team = new Team({ teamName });
        await team.save();
        req.flash('success_msg', 'Team created successfully');
        res.redirect('/teams');
    } catch (err) {
        req.flash('error_msg', 'Error creating team');
        res.redirect('/teams');
    }
});

// Update team (admin only)
router.put('/:id', isAdmin, async (req, res) => {
    try {
        const { teamName } = req.body;
        await Team.findByIdAndUpdate(req.params.id, { teamName });
        req.flash('success_msg', 'Team updated successfully');
        res.redirect('/teams');
    } catch (err) {
        req.flash('error_msg', 'Error updating team');
        res.redirect('/teams');
    }
});

// Delete team (admin only)
router.delete('/:id', isAdmin, async (req, res) => {
    try {
        await Team.findByIdAndDelete(req.params.id);
        req.flash('success_msg', 'Team deleted successfully');
        res.redirect('/teams');
    } catch (err) {
        req.flash('error_msg', 'Error deleting team');
        res.redirect('/teams');
    }
});

module.exports = router; 