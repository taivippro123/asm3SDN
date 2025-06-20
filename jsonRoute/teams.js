const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const { isAdmin } = require('../middleware/auth');

// Get all teams (public)
router.get('/', async (req, res) => {
    try {
        const teams = await Team.find();
        res.json({ success: true, data: teams });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error fetching teams' });
    }
});

// Get single team (public)
router.get('/:id', async (req, res) => {
    try {
        const team = await Team.findById(req.params.id);
        if (!team) {
            return res.status(404).json({ success: false, message: 'Team not found' });
        }
        res.json({ success: true, data: team });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error fetching team' });
    }
});

// Create team (admin only)
router.post('/', isAdmin, async (req, res) => {
    try {
        const { teamName } = req.body;
        const team = new Team({ teamName });
        await team.save();
        res.status(201).json({ success: true, data: team });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error creating team' });
    }
});

// Update team (admin only)
router.put('/:id', isAdmin, async (req, res) => {
    try {
        const { teamName } = req.body;
        const updated = await Team.findByIdAndUpdate(req.params.id, { teamName }, { new: true });
        if (!updated) return res.status(404).json({ success: false, message: 'Team not found' });
        res.json({ success: true, data: updated });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error updating team' });
    }
});

// Delete team (admin only)
router.delete('/:id', isAdmin, async (req, res) => {
    try {
        const deleted = await Team.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ success: false, message: 'Team not found' });
        res.json({ success: true, message: 'Team deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error deleting team' });
    }
});

module.exports = router; 