const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const { isAdmin } = require('../middleware/auth');
const Player = require('../models/Player');
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

// GET /accounts/:id/comments
router.get('/:id/comments', async (req, res) => {
    try {
      const memberId = req.params.id;
  
      const players = await Player.find({ 'comments.author': memberId })
        .select('playerName comments') // lấy tên + comments
        .lean();
  
      const comments = [];
  
      players.forEach(player => {
        player.comments.forEach(comment => {
          if (comment.author.toString() === memberId) {
            comments.push({
              playerId: player._id,
              playerName: player.playerName,
              rating: comment.rating,
              content: comment.content,
              createdAt: comment.createdAt,
            });
          }
        });
      });
  
      res.render('accountComments', { comments }); // chuyển qua view
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  });

module.exports = router; 