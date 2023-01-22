const express = require('express')
const httpProxy = require('express-http-proxy')
const app = express()
const userStoriesData = require('./utils/constants').userStories;
const port = 4000

const userServiceProxy = httpProxy('http://localhost:3000/')
const userServiceProxy2 = httpProxy('http://localhost:8002/')

var cors = require('cors')

app.use(cors())

// Authentication
app.use((req, res, next) => {
  // TODO: my authentication logic
  next()
})

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
app.post('/userstories',(req,res,next)=>{
  try {
    //TODO Delete this after prototype presentation lol
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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})