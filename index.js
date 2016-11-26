var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();

var jsonObj = [
    {
        id: 1,
        message: "Do you already know what you want to study?",
        next: [
            { id: 11, button: "Yep!" },
            { id: 12, button: "sort of..."  },
            { id: 13, button: "Not at all"  }
        ]
    },
    {
        id: 11,
        message: "Oh wow. You're beating me then :). Are you worried your not going to get in?",
        next: [
            { id: 111, button: "Yeah" },
            { id: 112, button: "Nah" }
        ]
    },
    {
        id: 12,
        message: "Oh, are you having doubts about want you want? Or did you want more info about your choice? Unless, you're worried you won't get the marks to get in? O.o",
        next: [
            { id: 121, button: "having doubts" },
            { id: 122, button: "want more info" }
        ]
    },
    {
        id: 13,
        message: "Fair enough. It's pretty early in your life to have this figured out. Tbh, to get inspiration, a good start is to talk to people, whether its family, friends, or school counsellors."
    },
    {
        id: 111,
        message: "Ah mate, don't worry I was worried as hell. I wanted to get into computer science which required 89 when I was applying. My school was weird. The principal gave each student"
    },
    {
        id: 112,
        message: "Alright, anything else you wanted to chat about mate?"
    },
    {
        id: 121,
        message: "Fair enough, It's pretty ridiculous that they make you make such a big decision so early on in your life. But you know what, I changed degrees 2 times mate, and plenty of my friends too :). Actually about 50% of students change their degree during their time at uni. Did you want more info? Or help with anything else?"
    }
]

// replyObj = [];
// optionIDs = determine_next_response(2);
// console.log(optionIDs)
// for (var key in optionIDs) {
//     replyObj.push({
//         content_type:   "text",
//         title:          optionIDs[key].button,
//         payload:        optionIDs[key].id
//     });
// }
//
// console.log(replyObj);

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
            if (!banter_text(event.sender.id, event.message.text)) {
                messageHelper(event.sender.id, {
                    text: "Mate, I have no clue what you're talking about."
                });
            }
        } else if (event.postback) {
    		//ignore the initial "Get started" button
    		if (event.postback.payload === 0) {
        		messageHelper(event.sender.id,  {
                    text: "Hi! I'm Damo, I graduated highschool a few years ago, and I've learnt a lot since then. I'm here to help you with HSC stress. Check out the options in the menu below and if you want to talk about one give it a click."
                });
    		} else if (!quickReply(event.sender.id, event.postback.payload)) {
                messageHelper(event.sender.id, {
                    text: "Mate, I have no clue what you're talking about."
                });
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
            recipient: { id: recipientId },
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
function banter_text(recipientID, text) {

}

function quickReply(recipientId, id) {
    var optionIDs = determine_next_response(id);
    if (optionIDs == null) return false;

    replyObj = [];
    for (var key in optionIDs) {
        replyObj.push({
            content_type:   "text",
            title:          optionIDs[key].button,
            payload:        optionIDs[key].id
        });
    }

    var text = determine_message(id);

    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
        method: 'POST',
        json: {
            recipient:      {id: recipientId},
            sender_action:  "typing_on",
            message: {
                text:   text,
                quick_replies: replyObj
            }
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });

    return true;
}

function determine_message(id) {
    for (key in jsonObj) {
        if (jsonObj.hasOwnProperty(id) && jsonObj[key].id == id) {
            return jsonObj[key].message;
        }
    }
}

function determine_next_response(id) {
    for (key in jsonObj) {
        if (jsonObj.hasOwnProperty(id) && jsonObj[key].id == id) {
            return jsonObj[key].next;
        }
    }

    return null;
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
                    type:    "postback",
                    title:   "Careers",
                    payload: 1
                },
                {
                    type:    "postback",
                    title:   "Exams",
                    payload: 2
                },
                {
                    type:    "postback",
                    title:   "Study",
                    payload: 3
                },
                {
                    type:    "postback",
                    title:   "Pressure from others",
                    payload: 4
                },
                {
                    type:    "postback",
                    title:   "Refer a friend about this",
                    payload: 5
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
