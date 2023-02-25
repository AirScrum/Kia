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
                res.redirect(`http://localhost:3000/`)
            }
            res.redirect(`http://localhost:3000/?token=` + token)
        }
    );
    
};



module.exports = { authenticate };
