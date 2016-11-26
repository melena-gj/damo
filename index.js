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
    // Create a menu at startup
    persistent_menu();

    var events = req.body.entry[0].messaging;
    for (i = 0; i < events.length; i++) {
        var event = events[i];

        if (event.message && event.message.text) {
            // Responses
            if (!banterTheUser(event.sender.id, event.message.text)) {
                messageHelper(event.sender.id, {text: "Mate, I have no clue what you're talking about."});
            }
        } else if (event.postback) {
    		//ignore the initial "Get started" button
    		if (event.postback.payload==="USER_DEFINED_PAYLOAD") {
        		messageHelper(event.sender.id,  {text: "Hi! I'm Damo, I graduated highschool a few years ago, and I've learnt a lot since then. I'm here to help you with HSC stress. Do any of these areas interest you?"});
    		} else if (!banterTheUser(event.sender.id, event.postback.payload)) {
                messageHelper(event.sender.id, {text: "Mate, I have no clue what you're talking about."})
            }
        }
    }
    res.sendStatus(200);
});

messageHelper = function(recipientId, message) {
    // setTimeout(sendMessage(recipientId, message), 300)
    sendMessage(recipientId, message)
}

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

    //1st layer
    if (values[0]==="Careers") {
    	sendMessage(recipientID, {text: "u have no career m8"});
        quick_reply("1", "2", "3");
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
    } else if (values[0]==="Refer") {
    	sendMessage(recipientID, {text: "Tell your friends about us at http://m.me/Damo"});

    	return true;
    }

    //2nd layer

    //3rd layer

    //4th layer

    return false;
}

function quick_reply(option1, option2, option3) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
        method: 'POST',
        json: {
            recipient: {id: recipientId},
            message:{
                text:   "Pick a color:",
                quick_replies:[
                    {
                        content_type:   "text",
                        title:          option1,
                        payload:        1
                    },
                    {
                        content_type:   "text",
                        title:          option2,
                        payload:        2
                    },
                    {
                        content_type:   "text",
                        title:          option3,
                        payload:        3
                    },
                ]
            }
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
}

function persistent_menu() {
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
                    payload:"Careers"
                },
                {
                    type:   "postback",
                    title:  "Exams",
                    payload:"Exams"
                },
                {
                    type:   "postback",
                    title:  "Study",
                    payload:"Study"
                },
                {
                    type:   "postback",
                    title:  "Pressure from others",
                    payload:"Pressure"
                },
                {
                    type:   "postback",
                    title:  "Refer a friend about this",
                    payload:"Refer"
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

function refer() {

}

// Page Access Token
// EAAIbXYKgzQMBAExoT6aGqebPVFDty6tUUngZBmxJB59oholnZChWC7ZCb7nSIPLyprj5tyvbwIdMYi9ewz1xZBeWtx4wJzqZBcOQp6TBRxLpbZCpUekZBZAlA6sqZBD4aZAD02ZCQbw0j2JWAjrNXZAmrRytxgYZAc1fWccbtZANeDac9XDgZDZD
