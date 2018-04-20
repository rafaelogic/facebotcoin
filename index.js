'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const Bot = require('./bot/platform');
require('dotenv').config();

const app = express();

app.set('port', (process.env.PORT || 5000));

// data processing
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// routes
app.get('/', function(req, res) {
  res.send('Hi I am a chatbot');
})

app.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === process.env.VALIDATION_TOKEN) {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.log("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);
  }
});


app.post('/webhook', function (req, res) {
  var data = req.body;

  // Make sure this is a page subscription
  if (data.object == 'page') {
    // Iterate over each entry
    // There may be multiple if batched
    data.entry.forEach(function(pageEntry) {
      var pageID = pageEntry.id;
      var timeOfEvent = pageEntry.time;

      pageEntry.messaging.forEach(function(messagingEvent) {
        if (messagingEvent.message) {
          Bot.receivedMessage(messagingEvent);
        } else {
          console.log("Webhook received unknown messagingEvent: ", messagingEvent);
        }
      });
    });

    res.sendStatus(200);
  }
});

// start server
app.listen(app.get('port'), function() {
  console.log("running on port "+app.get('port'));
})
