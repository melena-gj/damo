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
app.post('/webhook', function (req, res)) {
	var events = req.body.entry[0].messaging;
  for (i = 0; i < events.length; i++) {
    var event = events[i];
      if (event.message && event.message.text) {
      	sendMessage(event.sender.id, {text: event.message.text});
        if (!banterTheUser(event.sender.id, event.message.text)) {
          sendMessage(event.sender.id, {text: "Mate, I have no clue what you're talking about."});
        }
      }
    }
  }
  res.sendStatus(200);
};

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

//questions to ask start asking what the user wants
function banterTheUser(recipientID, text) {
    text = text || "";
    var values = text.split(' ');

    if (values[0]==="Careers") {
    	sendMessage(recipientID, {text: "u have no career m8"});
    	return true;
    } else if (values[0]==="Exams") {
    	sendMessage(recipientID, {text: "u'r going to fail ur exams"});
    	return true;
    } else if (values[0]==="Study") {
    	sendMessage(recipientID, {text: "u just might as well get drunk"});
    	return true;
    } else if (values[0]==="Pressure") {
    	sendMessage(recipientID, {text: "just kill urself"});
    	return true;
    } else {
    	return false;
    }
}

function persistent_menu() {
    sendMessage(event.sender.id, {text: "Creating menu"});
    request({
        url: 'https://graph.facebook.com/v2.6/me/thread_settings',
        qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
        method: 'POST',
        json: {
            setting_type : "call_to_actions",
            thread_state : "existing_thread",
            call_to_actions:[
                {
                    type:   "postback",
                    title:  "Careers",
                    payload:"DEVELOPER_DEFINED_PAYLOAD_FOR_CAREERS"
                },
                {
                    type:   "postback",
                    title:  "Exams",
                    payload:"DEVELOPER_DEFINED_PAYLOAD_FOR_EXAMS"
                },
                {
                    type:   "postback",
                    title:  "Study",
                    payload:"DEVELOPER_DEFINED_PAYLOAD_FOR_STUDY"
                },
                {
                    type:   "postback",
                    title:  "Pressure from others",
                    payload:"DEVELOPER_DEFINED_FOR_PRESSURE"
                },
                {
                    type:   "postback",
                    title:  "Tell a friend about this",
                    payload:"DEVELOPER_DEFINED_FOR_PRESSURE"
                }
            ]
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};

// Page Access Token
// EAAIbXYKgzQMBAExoT6aGqebPVFDty6tUUngZBmxJB59oholnZChWC7ZCb7nSIPLyprj5tyvbwIdMYi9ewz1xZBeWtx4wJzqZBcOQp6TBRxLpbZCpUekZBZAlA6sqZBD4aZAD02ZCQbw0j2JWAjrNXZAmrRytxgYZAc1fWccbtZANeDac9XDgZDZD
