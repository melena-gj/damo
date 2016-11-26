var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 3000));

// Server frontpage
app.get('/', function (req, res) {
    res.send('This is TestBot Server');
});

// Facebook Webhook
app.get('/webhook', function (req, res) {
  // res.send(req.query['hub.verify_token'])
    if (req.query['hub.verify_token'] === 'damo-token') {
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Invalid verify token');
    }
});

// handler receiving messages
app.post('/webhook', function (req, res) {
    var events = req.body.entry[0].messaging;
    for (i = 0; i < events.length; i++) {
        var event = events[i];
        if (event.message && event.message.text) {
            if (!bevMessage(event.sender.id, event.message.text)) {
                sendMessage(event.sender.id, {text: "Mate, I have no clue what you're talking about."});
            }
        }
    }
    res.sendStatus(200);
});

// generic function sending messages
function sendMessage(recipientId, message) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: {
            recipient: {id: recipientId},
            message: message,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};

// send rich message with bev
function bevMessage(recipientId, text) {

  text = text || "";
  var values = text.split(' ');

  if (values[0] === 'hsc') {
    // if (Number(values[1]) > 0 && Number(values[2]) > 0) {

    // var imageUrl = "https://lorempixel.com/" + Number(values[1]) + "/" + Number(values[2])+"/nightlife";
		// var imageUrl = "https://lorempixel.com/640/480/nightlife";

		// message = {
		// 	"attachment": {
		// 		"type": "template",
		// 		"payload": {
		// 			"template_type": "generic",
		// 			"elements": [{
		// 				"title": "Nightlife",
		// 				"subtitle": "The bevs are truly on",
		// 				"image_url": imageUrl ,
		// 				"buttons": [{
		// 					"type": "web_url",
		// 					"url": imageUrl,
		// 					"title": "Show bevs"
		// 				}, {
  //             "type": "postback",
  //             "title": "I like this",
  //             "payload": "User " + recipientId + " likes bev " + imageUrl,
  //           }]
  //         }]
  //       }
  //     }
		// };

    // sendMessage(recipientId, message);
		sendMessage(recipientId, {text: 'just shoot me now fam.'});

		return true;
        // }
  } else {

    // sendMessage(recipientId, message);
		sendMessage(recipientId, {text: 'HSCCC!!!!!!! :('});

		return true;
  }

  return false;

};
