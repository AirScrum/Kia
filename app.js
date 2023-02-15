//Requires
const express = require('express')
const httpProxy = require('express-http-proxy')
var cors = require('cors')
const mongoose = require('mongoose');
var axios = require("axios").default;
const dotenv=require('dotenv').config();
const userStoriesData = require('./utils/constants').userStories;
const { hashSync, compareSync } = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');
var myPassportService = require('./config/passport');

//Schema requires
const UserModel = require('./models/user');

// Instances
const app = express()
const userServiceProxy = httpProxy('http://localhost:3000/')
const userServiceProxy2 = httpProxy('http://localhost:8002/')

// Middlewares
app.use(cors())
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(express.json())

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
 * Account Management Routes
 * 
 */

// To register
app.post('/register', (req, res) => {
    const user = new UserModel({
        email: req.body.email,
        password: hashSync(req.body.password, 10)
    })

    user.save().then(user => {
        res.send({
            success: true,
            message: "User created successfully.",
            user: {
                id: user._id,
                email: user.email
            }
        })
    }).catch(err => {
        res.send({
            success: false,
            message: "Something went wrong",
            error: err
        })
    })
})

// To login
app.post('/login', (req, res) => {
    UserModel.findOne({ email: req.body.email }).then(user => {

        // No user found or incorrect password
        if (!user || !compareSync(req.body.password, user.password)) {
            return res.status(401).send({
                success: false,
                message: "Could not find the user"
            })
        }

        const payload = {
            email: user.email,
            id: user._id
        }

        const token = jwt.sign(payload, process.env.SECRET_STRING, { expiresIn: "10h" })

        return res.status(200).send({
            success: true,
            message: "Logged in successfully!",
            token: "Bearer " + token
        })
    })
})

// Example of protected routes
app.get('/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
    return res.status(200).send({
        success: true,
        user: {
            id: req.user._id,
            username: req.user.email,
        }
    })
})



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
