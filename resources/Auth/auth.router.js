const passport = require("passport");
var myPassportService = require("../../config/passport");
const { register, login, protected } = require("./auth.controller");
const { Router } = require("express");
const authRouter = Router();
/**
 *
 * Account Management Routes
 *
 */

authRouter.route("/register").post(register);
authRouter.route("/login").post(login);
authRouter
  .route("/protected")
  .post(passport.authenticate("jwt", { session: false }), protected);
module.exports = { authRouter };
