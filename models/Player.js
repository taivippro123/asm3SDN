const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    rating: {
        type: Number,
        min: 1,
        max: 3,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        required: true
    }
}, { timestamps: true });

const playerSchema = new mongoose.Schema({
    playerName: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    cost: {
        type: Number,
        required: true
    },
    isCaptain: {
        type: Boolean,
        default: false
    },
    information: {
        type: String,
        required: true
    },
    comments: [commentSchema],
    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Player', playerSchema); 