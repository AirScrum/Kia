//Requires
const express = require('express')
const httpProxy = require('express-http-proxy')
var cors = require('cors')
const mongoose = require('mongoose');
var axios = require("axios").default;
const dotenv=require('dotenv').config();
const userStoriesData = require('./utils/constants').userStories;
const passport = require('passport');

// Instances
const app = express()
const userServiceProxy = httpProxy('http://localhost:3000/')
const userServiceProxy2 = httpProxy('http://localhost:8002/')

// Middlewares
app.use(cors())
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(express.json())

// To make app routes on users to user.router.js
require('./resources/User/user.router')(app);

//To connect to database
const dbURI=process.env.MONGO_DB_URI;

mongoose.connect(process.env.MONGO_DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => {
        app.listen(process.env.PORT || 4000)
        console.log(`Example app listening on port ${process.env.PORT}`)
    }
    )
    .catch((err) => console.log(err));




/**
 * 
 * Other Routes
 * 
 */

// Proxy request
app.get('/', (req, res, next) => {
  userServiceProxy(req, res, next)
})

//Route the request to the Speech2Text service
app.get('/request/speech2text', (req, res, next) => {
  userServiceProxy(req, res, next)
})

/**
 * @author Shehab Adel
 * @summary A prototype middleware to return static user stories
 */
app.post('/userstories',async (req,res,next)=>{
  try {
    //TODO Delete this after prototype presentation lol
    await new Promise(resolve => setTimeout(resolve, 10000));
    res.json({data:userStoriesData}).status(200).send();
  } catch (error) {
    console.error(error)
    res.status(500).end();
  }
})

//Route request to the Processing service
app.post('/request/process', (req, res, next) => {
  userServiceProxy2(req, res, next)
})
