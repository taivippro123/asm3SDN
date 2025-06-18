const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Member = require('../models/Member');

module.exports = function(passport) {
    passport.use(
        new LocalStrategy({ usernameField: 'membername' }, async (membername, password, done) => {
            try {
                const member = await Member.findOne({ membername: membername });
                
                if (!member) {
                    return done(null, false, { message: 'That membername is not registered' });
                }

                const isMatch = await member.comparePassword(password);
                if (isMatch) {
                    return done(null, member);
                } else {
                    return done(null, false, { message: 'Password incorrect' });
                }
            } catch (err) {
                return done(err);
            }
        })
    );

    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            let member = await Member.findOne({ googleId: profile.id });
            if (!member) {
                member = new Member({
                    googleId: profile.id,
                    name: profile.displayName,
                    membername: profile.emails[0].value,
                    isAdmin: false
                });
                await member.save();
            }
            return done(null, member);
        } catch (err) {
            return done(err, null);
        }
    }
    ));

    passport.serializeUser((member, done) => {
        done(null, member.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const member = await Member.findById(id);
            done(null, member);
        } catch (err) {
            done(err, null);
        }
    });
}; 


