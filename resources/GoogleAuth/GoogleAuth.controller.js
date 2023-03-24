const jwt = require('jsonwebtoken');
const { encrypt } = require('../User/user.controller');
const UserModel = require("../User/user.model");

// Function to authenticate
const authenticate = async (req, res) => {
    try {
        const [accessToken, refreshToken] = await Promise.all([
            new Promise((resolve, reject) => {
                const timestamp = Date.now();
                jwt.sign(
                    { id: req.user.id, timestamp },
                    process.env.SECRET_STRING,
                    { expiresIn: "1h" },
                    (err, token) => {
                        if (err) reject(err);
                        else resolve(token);
                    }
                );
            }),
            new Promise((resolve, reject) => {
                const timestamp = Date.now();
                jwt.sign(
                    { id: req.user.id, timestamp },
                    process.env.SECRET_STRING_REFRESH,
                    { expiresIn: "1d" },
                    (err, refToken) => {
                        if (err) reject(err);
                        else resolve(refToken);
                    }
                );
            })
        ]);

        await UserModel.updateOne(
            { _id: req.user.id },
            { refreshToken: encrypt(refreshToken) }
        );


        res.redirect(process.env.CLIENT_URL + '?token=' + accessToken + '&refresh_token=' + encrypt(refreshToken));
    } catch (error) {
        console.error(error);
        res.redirect(process.env.CLIENT_URL);
    }
};



module.exports = { authenticate };
