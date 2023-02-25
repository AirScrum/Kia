const jwt = require('jsonwebtoken');

// Function to authenticate
const authenticate = (req, res) => {
    console.log(req.user)
    jwt.sign(
        { id: req.user.id },
        process.env.SECRET_STRING,
        { expiresIn: "10h" },
        (err, token) => {
            if (err) {
                res.redirect(process.env.CLIENT_URL)
            }
            res.redirect(process.env.CLIENT_URL+ '?token=' + token)
        }
    );
    
};



module.exports = { authenticate };
