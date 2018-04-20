const request = require('request');
const provider = require('./provider');
const helper = require('./helper');
require('dotenv').config();

var firstQuickReplyPayload = "";

var receivedMessage = function (event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:",
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var isEcho = message.is_echo;
  var messageId = message.mid;
  var appId = message.app_id;
  var metadata = message.metadata;

  // You may get a text or attachment but not both
  var messageText = message.text;
  var messageAttachments = message.attachments;
  var quickReply = message.quick_reply;

  getName(senderID)
    .then(sender => {
         var first_name = sender.first_name;

         if (isEcho) {
           // Just logging message echoes to console
           console.log("Received echo for message %s and app %d with metadata %s",
             messageId, appId, metadata);
           return;
         } else if (quickReply) {
           var quickReplyPayload = quickReply.payload;
           switch (quickReplyPayload) {
             case 'buy':
               firstQuickReplyPayload = quickReplyPayload;
               sendCurrencySelectionMessage(senderID, first_name);
              break;

              case 'sell':
                firstQuickReplyPayload = quickReplyPayload;
                sendCurrencySelectionMessage(senderID, first_name);
               break;

              case 'CLP':
              case 'HKD':
              case 'IDR':
              case 'MYR':
              case 'PHP':
              case 'THB':
              case 'TWD':
              case 'USD':
              case 'VND':
                provider
                  .quotes(quickReplyPayload)
                  .then(quote => {
                    if(firstQuickReplyPayload === 'buy'){
                      var info = {
                        name: first_name,
                        type: firstQuickReplyPayload,
                        currency: quickReplyPayload,
                        price: helper.numberWithCommas(quote.ask)
                      }
                      sendTextMessage(senderID, bitcoinPriceMessage(info));
                    }else if (firstQuickReplyPayload === 'sell'){
                      var info = {
                        name: first_name,
                        type: firstQuickReplyPayload,
                        currency: quickReplyPayload,
                        price: helper.numberWithCommas(quote.bid)
                      }
                      sendTextMessage(senderID, bitcoinPriceMessage(info));
                    }
                  })
                  .catch(err => {
                     console.log(err);
                  });
              break;

            default:
               sendTextMessage(senderID, "Quick reply tapped");
           }
           return;
         }

         if (messageText) {

           // If we receive a text message, check to see if it matches any special
           // keywords and send back the corresponding example. Otherwise, just echo
           // the text we received.
           switch (messageText.replace(/[^\w\s]/gi, '').trim().toLowerCase()) {
             case 'hello':
             case 'hi':
               sendTypingOn(senderID);
               greetingMessage(senderID, first_name);
               sendTypingOff(senderID);
               break;

             case 'help':
               sendTypingOn(senderID);
               sendHelpMessage(senderID, first_name);
               sendTypingOff(senderID);
               break;

             default:
               sendTextMessage(senderID, messageText);
           }
         } else if (messageAttachments) {
           sendTypingOn(senderID);
           sendTextMessage(senderID, "Message with attachment received");
           sendTypingOff(senderID);
         }
    })
    .catch(err => {
        console.log(err);
    });
}

function getName(senderId) {
  return new Promise((resolve, reject) => {
    request({
      uri: 'https://graph.facebook.com/v2.6/'+senderId+'?fields=first_name&access_token='+process.env.PAGE_ACCESS_TOKEN,
      method: 'GET',
      json: true
    },function(error, res, body) {
      if(error) {
        return reject(error)
      }
      resolve(body);
      });
  });
}

function greetingMessage (recipientId, name) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text:  `
Welcome to Botcoin ${name}!
Type "help" to get started.
      `
    }
  }
  callSendAPI(messageData);
}

function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText,
      metadata: "DEVELOPER_DEFINED_METADATA"
    }
  };

  callSendAPI(messageData);
}

function sendHelpMessage(recipientId, name) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: `What bitcoin price you want to know ${name}?`,
      quick_replies: [
        {
          "content_type":"text",
          "title":"Buy",
          "payload":"buy"
        },
        {
          "content_type":"text",
          "title":"Sell",
          "payload":"sell"
        }
      ]
    }
  };

  callSendAPI(messageData);
}

function sendCurrencySelectionMessage(recipientId, name) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: `In what currency you want to set the bitcoin price ${name}?`,
      quick_replies: [
        {
          "content_type":"text",
          "title":"CLP",
          "payload":"CLP"
        },
        {
          "content_type":"text",
          "title":"HKD",
          "payload":"HKD"
        },
        {
          "content_type":"text",
          "title":"IDR",
          "payload":"IDR"
        },
        {
          "content_type":"text",
          "title":"MYR",
          "payload":"MYR"
        },
        {
          "content_type":"text",
          "title":"PHP",
          "payload":"PHP"
        },
        {
          "content_type":"text",
          "title":"TWD",
          "payload":"TWD"
        },
        {
          "content_type":"text",
          "title":"USD",
          "payload":"USD"
        },
        {
          "content_type":"text",
          "title":"VND",
          "payload":"VND"
        }
      ]
    }
  };

  callSendAPI(messageData);
}

function bitcoinPriceMessage(info) {
  return `${info.name}, if you want to ${info.type} bitcoin the current price in ${info.currency} is ${info.price}`;
}

function sendTypingOn(recipientId) {
  console.log("Turning typing indicator on");

  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "typing_on"
  };

  callSendAPI(messageData);
}

function sendTypingOff(recipientId) {
  console.log("Turning typing indicator off");

  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "typing_off"
  };

  callSendAPI(messageData);
}

function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      if (messageId) {
        console.log("Successfully sent message with id %s to recipient %s",
          messageId, recipientId);
      } else {
      console.log("Successfully called Send API for recipient %s",
        recipientId);
      }
    } else {
      console.error("Failed calling Send API", response.statusCode, response.statusMessage, body.error);
    }
  });
}

module.exports = { receivedMessage }
