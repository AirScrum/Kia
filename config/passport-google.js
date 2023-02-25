const passport = require("passport");
const UserModel = require('../resources/User/user.model');
const GoogleStrategy = require("passport-google-oauth20").Strategy;


passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: "http://localhost:4000/auth/callback",
        },

        function (accessToken, refreshToken, profile, cb) {
            
            // Todo: Check first if googleId matches, then check if email matches
            UserModel.findOne({ googleId: profile.id, email: profile.emails[0].value }, (err, user) => {
                if (err) return cb(err, null);
                if (!user) {
                    let newUser = new UserModel({
                        googleId: profile.id,
                        fullName: profile.displayName,
                        email: profile.emails[0].value
                    });

                    newUser.save();
                    return cb(null, newUser);
                } else {
                    return cb(null, user);
                }
            });
        }
    )
);

//Persists user data inside session
passport.serializeUser(function (user, done) {
    done(null, user.id);
});

//Fetches session details using session id
passport.deserializeUser(function (id, done) {
    UserModel.findById(id, function (err, user) {
        done(err, user);
    });
});
