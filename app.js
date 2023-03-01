//Requires
const express = require("express");
const httpProxy = require("express-http-proxy");
var cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const passport = require("passport");
const session = require("express-session");

// Instances
const app = express();
const userServiceProxy = httpProxy("http://localhost:3000/");
const userServiceProxy2 = httpProxy("http://localhost:8002/");

// Middlewares
app.use(session({ secret: process.env.EXPRESS_SECRET }));
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());

// To make app routes on users to user.router.js and GoogleAuth.router.js
require("./resources/User/user.router")(app);
require("./resources/GoogleAuth/GoogleAuth.router")(app);

//To connect to database
const dbURI = process.env.MONGO_DB_URI;

mongoose
  .connect(process.env.MONGO_DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((result) => {
    app.listen(process.env.PORT || 4000);
    console.log(
      `Air Scrum's Gateway(Kia): is listening on port ${process.env.PORT}`
    );
  })
  .catch((err) => console.log(err));

/**
 *
 * Other Routes
 *
 */

// Proxy request
app.get("/", (req, res, next) => {
  userServiceProxy(req, res, next);
});

//Route the request to the Speech2Text service
app.get("/request/speech2text", (req, res, next) => {
  userServiceProxy(req, res, next);
});

//Route request to the Processing service
app.post("/request/process", (req, res, next) => {
  userServiceProxy2(req, res, next);
});
