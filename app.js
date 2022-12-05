const express = require('express')
const httpProxy = require('express-http-proxy')
const app = express()

const port = 4000

const userServiceProxy = httpProxy('http://localhost:3000/')
const userServiceProxy2 = httpProxy('http://localhost:8002/')

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

//Route request to the Processing service
app.post('/request/process', (req, res, next) => {
  userServiceProxy2(req, res, next)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})