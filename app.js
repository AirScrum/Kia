//Requires
const express = require("express");
const httpProxy = require("express-http-proxy");
var cors = require("cors");
const mongoose = require("mongoose");
var axios = require("axios").default;
const dotenv=require('dotenv').config();
const userStoriesData = require('./utils/constants').userStories;
const passport = require('passport');
const session = require('express-session');
const multer  = require('multer');
const fs = require('fs');

// Instances
const app = express()
const userServiceProxy = httpProxy('http://localhost:4001/')
const userServiceProxy2 = httpProxy('http://localhost:8002/')

// Middlewares
app.use(session({ secret: process.env.EXPRESS_SECRET }));
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json())


// Define the storage location and filename of uploaded file
const upload = multer({ dest: 'uploads/' });

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
    console.log(`Example app listening on port ${process.env.PORT}`);
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


/**
 * Converting speech to text, first upload file to convert it to array of buffer and send it to speech to text service. And authenticate user to get user id
 */
app.post('/request/speech2text',upload.single('file'), passport.authenticate("jwt", { session: false }), (req,res,next)=>{

  const { path } = req.file;
  const audioBuffer = fs.readFileSync(path);

  // Prepare data to be sent to the speech to text service
  const data = {
    buffer: audioBuffer,
    userid: req.user._id
  };
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
    }
  };

  // delete the uploaded file
  fs.unlinkSync(path); 

  // Send the request using axios
  axios.post(process.env.SPEECH2TEXT_URL +'request/speech2text', data, config)
    .then(response => {

      /**
       * 
       * Todo, send a request to the processing service to begin processing
       * 
       */

      console.log(response.data)
      return res.status(200).send({sucess: "true"})
    })
    .catch(error => {
      return res.status(500).send(error)
    })

    
})

//Route request to the Processing service
app.post("/request/process", (req, res, next) => {
  userServiceProxy2(req, res, next);
});
