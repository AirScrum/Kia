const passport = require("passport");
var myPassportService = require("../../config/passport-google");
const { protected, success, failure, authenticate } = require('./user-google.controller')

module.exports = function (app) {

  /**
   *
   * Account Management Routes
   *
   */

  app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile','email'], prompt: 'select_account'}));

  app.get('/auth/callback',
    passport.authenticate('google', { session: false }), authenticate)

  app.get("/login/success",success);
  
  app.get("/login/failure",failure);

  // Example of protected routes
  app.get("/google-protected", passport.authenticate("jwt", { session: false }), protected);
  
};
