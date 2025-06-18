const express = require('express');
const router = express.Router();
const Player = require('../models/Player');
const Team = require('../models/Team');

// Home page
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
        res.render('index', { 
            players,
            teams,
            user: req.user,
            search,
            selectedTeam: team
        });
    } catch (err) {
        req.flash('error_msg', 'Error fetching data');
        res.render('index', { 
            players: [],
            teams: [],
            user: req.user,
            search: '',
            selectedTeam: ''
        });
    }
});

module.exports = router; 