const passport = require("passport");
const UserModel = require("../resources/User-google/user-google.model");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.SECRET_STRING;


passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: "http://localhost:4000/auth/callback",
        },

        function (accessToken, refreshToken, profile, cb) {
            console.log("Function login");
            console.log(accessToken, profile);
            UserModel.findOne({ googleId: profile.id }, (err, user) => {
                if (err) return cb(err, null);
                if (!user) {
                    let newUser = new UserModel({
                        googleId: profile.id,
                        name: profile.displayName,
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

/*passport.use(
    new JwtStrategy(opts, function (jwt_payload, done) {
        console.log("From google JWT")
        console.log(jwt_payload);
        UserModel.findById(jwt_payload.id, function (err, user) {
            if (err) {
                return done(err, false);
            }
            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        });
    })
)*/

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
