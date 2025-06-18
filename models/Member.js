const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const memberSchema = new mongoose.Schema({
    membername: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: function() { return !this.googleId; }
    },
    name: {
        type: String,
        required: true
    },
    YOB: {
        type: Number,
        required: function() { return !this.googleId; }
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    googleId: {
        type: String,
        default: null
    }
}, { timestamps: true });

// Hash password before saving
memberSchema.pre('save', async function(next) {
    if (!this.isModified('password') || this.googleId) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
memberSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Member', memberSchema); 