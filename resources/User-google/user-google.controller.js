const jwt = require('jsonwebtoken');

// Function to authenticate
const authenticate = (req, res) => {
    console.log(req.user.id)
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

// Function to simulate protected routes
const protected = (req, res) => {

    return res.status(200).send({
        success: true,
      });
};

// Login failure
const failure = (req, res) => {
    if (req.user) {
        res.status(401).json({
            success: false,
            message: "failure",
        });
    }
};

// Login success
const success = (req, res) => {
    if (req.user) {
        res.status(200).send({
            success: true,
            message: "successfull",
            user: req.user,
            //   cookies: req.cookies
        });
    } else {
        res.status(401).send({ msg: "Unauthorized" });
    }
};

module.exports = { protected, success, failure, authenticate };
