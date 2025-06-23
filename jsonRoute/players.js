const express = require('express');
const router = express.Router();
const Player = require('../models/Player');
const Team = require('../models/Team');
const { isAdmin, isAuthenticated } = require('../middleware/auth');

// Get all players (public)
router.get('/', async (req, res) => {
    try {
        const { search, team } = req.query;
        let query = {};
        if (search) {
            query.playerName = { $regex: search, $options: 'i' };
        }
        if (team) {
            query.team = team;
        }
        const players = await Player.find(query).populate('team');
        const teams = await Team.find();
        res.json({ success: true, data: { players, teams, search, selectedTeam: team } });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error fetching players' });
    }
});

// Get single player (public)
router.get('/:id', async (req, res) => {
    try {
        const player = await Player.findById(req.params.id)
            .populate('team')
            .populate('comments.author');
        if (!player) {
            return res.status(404).json({ success: false, message: 'Player not found' });
        }
        const teams = await Team.find();
        res.json({ success: true, data: { player, teams } });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error fetching player' });
    }
});

// Create player (admin only)
router.post('/', isAdmin, async (req, res) => {
    try {
        const { playerName, image, cost, isCaptain, information, team } = req.body;
        if (isCaptain === 'on' || isCaptain === true || isCaptain === 'true') {
            const hasCaptain = await Player.teamHasCaptain(team);
            if (hasCaptain) {
                return res.status(400).json({ success: false, message: 'This team already has a captain!' });
            }
        }
        const player = new Player({
            playerName,
            image,
            cost,
            isCaptain: isCaptain === 'on' || isCaptain === true,
            information,
            team
        });
        await player.save();
        res.status(201).json({ success: true, data: player });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error creating player' });
    }
});

// Update player (admin only)
router.put('/:id', isAdmin, async (req, res) => {
    try {
        const { playerName, image, cost, isCaptain, information, team } = req.body;
        if (isCaptain === 'on' || isCaptain === true || isCaptain === 'true') {
            const hasCaptain = await Player.exists({ team, isCaptain: true, _id: { $ne: req.params.id } });
            if (hasCaptain) {
                return res.status(400).json({ success: false, message: 'This team already has a captain!' });
            }
        }
        const updated = await Player.findByIdAndUpdate(req.params.id, {
            playerName,
            image,
            cost,
            isCaptain: isCaptain === 'on' || isCaptain === true,
            information,
            team
        }, { new: true });
        if (!updated) return res.status(404).json({ success: false, message: 'Player not found' });
        res.json({ success: true, data: updated });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error updating player' });
    }
});

// Delete player (admin only)
router.delete('/:id', isAdmin, async (req, res) => {
    try {
        const deleted = await Player.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ success: false, message: 'Player not found' });
        res.json({ success: true, message: 'Player deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error deleting player' });
    }
});

// Add comment (authenticated members only)
router.post('/:id/comments', isAuthenticated, async (req, res) => {
    if (req.user.isAdmin) {
        return res.status(403).json({ success: false, message: 'Admins are not allowed to comment' });
    }
    try {
        const player = await Player.findById(req.params.id);
        if (!player) {
            return res.status(404).json({ success: false, message: 'Player not found' });
        }
        // Check if user already commented
        const hasCommented = player.comments.some(
            comment => comment.author.toString() === req.user._id.toString()
        );
        if (hasCommented) {
            return res.status(400).json({ success: false, message: 'You have already commented on this player' });
        }
        const { rating, content } = req.body;
        player.comments.push({
            rating,
            content,
            author: req.user._id
        });
        await player.save();
        return res.json({ success: true, message: 'Comment added successfully', data: player });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Error adding comment' });
    }
});

// Edit comment (only by the comment's author, not admin)
router.put('/:id/comments/:commentId/edit', isAuthenticated, async (req, res) => {
    if (req.user.isAdmin) {
        return res.status(403).json({ success: false, message: 'Admins are not allowed to edit comments' });
    }
    try {
        const player = await Player.findById(req.params.id);
        if (!player) {
            return res.status(404).json({ success: false, message: 'Player not found' });
        }
        const comment = player.comments.id(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }
        if (comment.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'You are not authorized to edit this comment' });
        }
        comment.rating = req.body.rating;
        comment.content = req.body.content;
        await player.save();
        return res.json({ success: true, message: 'Comment updated successfully', data: player });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Error editing comment' });
    }
});

// Delete comment (only by the comment's author, not admin)
router.delete('/:id/comments/:commentId/delete', isAuthenticated, async (req, res) => {
    if (req.user.isAdmin) {
        return res.status(403).json({ success: false, message: 'Admins are not allowed to delete comments' });
    }
    try {
        const player = await Player.findById(req.params.id);
        if (!player) {
            return res.status(404).json({ success: false, message: 'Player not found' });
        }
        const comment = player.comments.id(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }
        if (comment.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'You are not authorized to delete this comment' });
        }
        // Sử dụng pull thay cho remove
        player.comments.pull(comment._id);
        await player.save();
        return res.json({ success: true, message: 'Comment deleted successfully', data: player });
    } catch (err) {
        console.error('Delete comment error:', err);
        return res.status(500).json({ success: false, message: 'Error deleting comment', error: err.message });
    }
});

module.exports = router; 