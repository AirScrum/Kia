const passport = require("passport");
var myPassportService = require("../../config/passport");
//Schema requires
const UserModel = require('./user.model');
const { hashSync, compareSync } = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = function (app) {

  /**
   *
   * Account Management Routes
   *
   */

  // To register
  app.post("/register", (req, res) => {
    const user = new UserModel({
      email: req.body.email,
      password: hashSync(req.body.password, 10),
    });

    user
      .save()
      .then((user) => {
        res.send({
          success: true,
          message: "User created successfully.",
          user: {
            id: user._id,
            email: user.email,
          },
        });
      })
      .catch((err) => {
        res.send({
          success: false,
          message: "Something went wrong",
          error: err,
        });
      });
  });

  // To login
  app.post("/login", (req, res) => {
    UserModel.findOne({ email: req.body.email }).then((user) => {
      // No user found or incorrect password
      if (!user || !compareSync(req.body.password, user.password)) {
        return res.status(401).send({
          success: false,
          message: "Could not find the user",
        });
      }

      const payload = {
        email: user.email,
        id: user._id,
      };
      

      const token = jwt.sign(payload, process.env.SECRET_STRING, {
        expiresIn: "10h",
      });

      return res.status(200).send({
        success: true,
        message: "Logged in successfully!",
        token: "Bearer " + token,
      });
    });
  });

  // Example of protected routes
  app.get(
    "/protected",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
      return res.status(200).send({
        success: true,
        user: {
          id: req.user._id,
          email: req.user.email,
        },
      });
    }
  );
};
