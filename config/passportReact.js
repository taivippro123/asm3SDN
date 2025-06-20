const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Member = require('../models/Member');

module.exports = function(passport) {
    passport.use('google-react', new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID_REACT,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET_REACT,
        callbackURL: process.env.GOOGLE_CALLBACK_URL_REACT
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            let member = await Member.findOne({ googleId: profile.id });
            if (!member) {
                member = new Member({
                    googleId: profile.id,
                    name: profile.displayName,
                    membername: profile.emails[0].value, // Dùng email làm membername
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
};
