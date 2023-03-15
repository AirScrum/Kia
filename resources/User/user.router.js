const passport = require("passport");
var myPassportService = require("../../config/passport");
const { register, login, protected, getProfileDetails , updateProfile, verifyToken, forgetPassword, validateLink, resetPassword} = require('./user.controller')

module.exports = function (app) {

  /**
   *
   * Account Management Routes
   *
   */

  // To register
  app.post("/register", register);

  // To login
  app.post("/login", login);

  // Example of protected routes
  app.get("/protected", passport.authenticate("jwt", { session: false }), protected);

  app.get("/profile", passport.authenticate("jwt", { session: false }), getProfileDetails);
  
  
  app.post("/profile", passport.authenticate("jwt", { session: false }), updateProfile);
  
  
  app.get("/:id/verify/:token/", verifyToken);

  app.post("/:id/reset/:token/", resetPassword);

  app.get("/:id/validate/:token/", validateLink);

  app.post("/forget", forgetPassword);
  
};
