const express = require('express');
const router = express.Router();
const Player = require('../models/Player');
const Team = require('../models/Team');

// Home page
router.get('/', async (req, res) => {
    try {
        const players = await Player.find()
            .populate('team')
            .sort({ createdAt: -1 });
        const teams = await Team.find();
        res.render('index', { 
            players,
            teams,
            user: req.user
        });
    } catch (err) {
        req.flash('error_msg', 'Error fetching data');
        res.render('index', { 
            players: [],
            teams: [],
            user: req.user
        });
    }
});

module.exports = router; 