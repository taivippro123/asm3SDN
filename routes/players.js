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
        res.render('players/index', { players, teams, search, selectedTeam: team });
    } catch (err) {
        req.flash('error_msg', 'Error fetching players');
        res.redirect('/');
    }
});

// Get single player (public)
router.get('/:id', async (req, res) => {
    try {
        const player = await Player.findById(req.params.id)
            .populate('team')
            .populate('comments.author');
        if (!player) {
            req.flash('error_msg', 'Player not found');
            return res.redirect('/players');
        }
        const teams = await Team.find();
        res.render('players/show', { player, teams });
    } catch (err) {
        req.flash('error_msg', 'Error fetching player');
        res.redirect('/players');
    }
});

// Create player (admin only)
router.post('/', isAdmin, async (req, res) => {
    try {
        const { playerName, image, cost, isCaptain, information, team } = req.body;
        const player = new Player({
            playerName,
            image,
            cost,
            isCaptain: isCaptain === 'on',
            information,
            team
        });
        await player.save();
        req.flash('success_msg', 'Player created successfully');
        res.redirect('/players');
    } catch (err) {
        req.flash('error_msg', 'Error creating player');
        res.redirect('/players');
    }
});

// Update player (admin only)
router.put('/:id', isAdmin, async (req, res) => {
    try {
        const { playerName, image, cost, isCaptain, information, team } = req.body;
        await Player.findByIdAndUpdate(req.params.id, {
            playerName,
            image,
            cost,
            isCaptain: isCaptain === 'on',
            information,
            team
        });
        req.flash('success_msg', 'Player updated successfully');
        res.redirect('/players');
    } catch (err) {
        req.flash('error_msg', 'Error updating player');
        res.redirect('/players');
    }
});

// Delete player (admin only)
router.delete('/:id', isAdmin, async (req, res) => {
    try {
        await Player.findByIdAndDelete(req.params.id);
        req.flash('success_msg', 'Player deleted successfully');
        res.redirect('/players');
    } catch (err) {
        req.flash('error_msg', 'Error deleting player');
        res.redirect('/players');
    }
});

// Add comment (authenticated members only)
router.post('/:id/comments', isAuthenticated, async (req, res) => {
    try {
        const player = await Player.findById(req.params.id);
        if (!player) {
            req.flash('error_msg', 'Player not found');
            return res.redirect('/players');
        }

        // Check if user already commented
        const hasCommented = player.comments.some(
            comment => comment.author.toString() === req.user._id.toString()
        );

        if (hasCommented) {
            req.flash('error_msg', 'You have already commented on this player');
            return res.redirect(`/players/${player._id}`);
        }

        const { rating, content } = req.body;
        player.comments.push({
            rating,
            content,
            author: req.user._id
        });

        await player.save();
        req.flash('success_msg', 'Comment added successfully');
        res.redirect(`/players/${player._id}`);
    } catch (err) {
        req.flash('error_msg', 'Error adding comment');
        res.redirect('/players');
    }
});

module.exports = router; 