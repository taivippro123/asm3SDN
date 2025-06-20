const express = require('express');
const router = express.Router();
const Player = require('../models/Player');
const Team = require('../models/Team');

// Home page (JSON)
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
        const players = await Player.find(query)
            .populate('team')
            .sort({ createdAt: -1 });
        const teams = await Team.find();
        res.json({
            success: true,
            data: {
                players,
                teams,
                user: req.user || null,
                search,
                selectedTeam: team || ''
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error fetching data',
            data: {
                players: [],
                teams: [],
                user: req.user || null,
                search: '',
                selectedTeam: ''
            }
        });
    }
});

module.exports = router; 