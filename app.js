//Requires
const express = require("express");
const httpProxy = require("express-http-proxy");
var cors = require("cors");
const mongoose = require("mongoose");
var axios = require("axios").default;
const dotenv = require("dotenv").config();
const userStoriesData = require("./utils/constants").userStories;
const passport = require("passport");
var myPassportService = require("./config/passport");
const session = require("express-session");
const multer = require("multer");
const fs = require("fs");
const morgan = require("morgan");

const https = require("https");
const path = require('path');

// Instances
const app = express();
const userServiceProxy = httpProxy("http://localhost:4001/");
const userServiceProxy2 = httpProxy("http://localhost:4002/");

// Middlewares
app.use(morgan("combined"));
app.use(session({ secret: process.env.EXPRESS_SECRET }));
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());

// Define the storage location and filename of uploaded file
const upload = multer({ dest: "uploads/" });

// To make app routes on users to user.router.js and GoogleAuth.router.js
require("./resources/User/user.router")(app);
require("./resources/GoogleAuth/GoogleAuth.router")(app);
require("./resources/UserStory/UserStory.router")(app);
// require("./resources/Text/text.router")(app);


// To make the server listen to HTTPS

const privateKeyPath = path.join('/etc/ssl/certs/airscrum.me', 'privkey3.pem');
const fullChainPath = path.join('/etc/ssl/certs/airscrum.me', 'fullchain3.pem');
const sslOptions = {
  key: fs.readFileSync(privateKeyPath),
  cert: fs.readFileSync(fullChainPath),
};

// Create HTTPS server
const server = https.createServer(sslOptions, app);

//To connect to database
mongoose
    .connect(process.env.MONGO_DB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then((result) => {
        server.listen(process.env.PORT || 4000);
        //app.listen(process.env.PORT || 4000);
        console.log(`Kia API Gateway listening on port ${process.env.PORT}`);
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
app.post(
    "/request/speech2text",
    upload.single("file"),
    passport.authenticate("jwt", { session: false }),
    async (req, res, next) => {
        const { path } = req.file;
        const audioBuffer = fs.readFileSync(path);
        // Prepare data to be sent to the speech to text service
        const data = {
            buffer: audioBuffer,
            userid: req.user._id,
        };
        const config = {
            headers: {
                "Content-Type": "application/json",
            },
        };
        // delete the uploaded file
        fs.unlinkSync(path);
        try {
            const speech2TxtResponse = await axios.post(
                process.env.SPEECH2TEXT_URL + "request/speech2text",
                data,
                config
            );
            console.log(`speech2TxtResponse data`, speech2TxtResponse.data);
            if (speech2TxtResponse.data?.text.id) {
                const processingResponse = await axios.post(
                    process.env.PROCESSING_URL,
                    {
                        textID: speech2TxtResponse.data?.text.id,
                    },
                    {
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );
                if(!processingResponse){
                    throw new Error()
                }
                return res.status(200).json({message:"File is being processed!",data:processingResponse.data})
            }else{
                return res.status(500).json({message:"Couldn't process the file"})
            }
        } catch (error) {
            console.error(error);
            if (error?.response) {
                return res
                    .status(error.response?.status)
                    .send(error.response?.data.error);
            } else if (error?.request) {
                return res.status(500).json({success:"False", error:error.toJSON()});
            } else {
                return res.status(500).send(error.message);
            }
        }
    }
);
//Route request to the Processing service
app.post("/request/process", (req, res, next) => {
    userServiceProxy2(req, res, next);
});

