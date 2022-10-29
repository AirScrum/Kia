const express = require('express')
const httpProxy = require('express-http-proxy')
var amqp = require('amqplib/callback_api');

const app = express()
app.use(express.json());

const port = 4000

// Proxy request
app.get('/', (req, res, next) => {
  //Extract the message
  const { message } = req.body
  //Connect to RabbitMQ
  amqp.connect('amqp://localhost', function (error0, connection) {
    if (error0) {
      throw error0;
    }
    connection.createChannel(function (error1, channel) {
      if (error1) {
        throw error1;
      }
      var queue = 'hello';
      //Send to queue
      channel.sendToQueue(queue, Buffer.from(message));
      console.log(" [x] Sent %s", message);
    });
  });

})

app.get('/u', (req, res, next) => {
  amqp.connect('amqp://localhost', function (error0, connection) {
    if (error0) {
      throw error0;
    }
    connection.createChannel(function (error1, channel) {
      if (error1) {
        throw error1;
      }
      var queue = 'hello';
      console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
      //Read from queue
      channel.consume(queue, function (msg) {
        console.log(" [x] Received %s", msg.content.toString());
      }, {
        noAck: true
      });
    });
  });

})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})