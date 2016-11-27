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
        		messageHelper(event.sender.id,  {text: "Hi! I'm Damo, I graduated highschool a few years ago, and I've learnt a lot since then. I'm here to help you with HSC stress. Check out the options in the menu below and if you want to talk about one give it a click."});
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
    text = text.toLowerCase() || "";

    // This will stop other message sending and shit it seems but will help you debug regardless
    // messageHelper(recipientID, {text: 'Debug: '+text});

    switch(text){

      // layer 1
      case "careers":
        quickReply(recipientID, "Yep!", "Sort of...", "Not at all", "Do you already know what you want to study?");
        break;
      case "exams":
        messageHelper(recipientID, {text: "Exams are inevitable during HSC, but it's important to remember they are just another part of life. Which stage of exams are you anticipating?"});
        break;
      case "study":
        messageHelper(recipientID, {text: "u just might as well get drunk"});
        break;
      case "pressure":
        // TODO make this four (missing the yourself option)
      	quickReply(recipientI, "Family", "Friends", "Teachers", "Ahh that's a shame. It's quite common as well unfortunately :/ Remember to ask people for help and advice whenever you need it by the way. Who are you feeling pressured from?");
        break;
      case "refer":
        messageHelper(recipientID, {text: "Tell your friends about us at http://m.me/Damo"});
        break;
      // layer 2
      // careers
      case "yep!":
        quickReply(recipientID, "Yeah","Nah","","Oh wow. You're beating me then :). Are you worried your not going to get in?")
        break;
      case "sort of...":
        quickReply(recipientID, "I'm having doubts","Want more info","Worried about marks","Oh, are you having doubts about want you want? Or did you want more info about your choice? Unless, you're worried you won't get the marks to get in? O.o")
        break;
      case "Not at all":
        messageHelper(recipientID, "Fair enough. It's pretty early in your life to have this figured out. To be honest, to get inspiration, a good start is to talk to people, whether its family, friends, or school counsellors. A good place to get started would be this career quiz :) http://joboutlook.gov.au/careerquiz.aspx")
        break;
      // layer 3
      // careers
      case "yeah":
        messageHelper(recipientID, {text: 'TODO'});
        break;
      case "nah":
        messageHelper(recipientID, {text: 'Alright, anything else you wanted to chat about mate? Click any of the menu options if there is.'});
        break;
      case "i'm having doubts":
        quickReply(recipientID, "Want more info", "Nah", "",
        "Fair enough, It's pretty ridiculous that they make you make such a big decision so early on in your life. But you know what, I changed degrees 2 times mate, and plenty of my friends too :). Actually about 50% of students change their degree during their time at uni. Did you want more info?");
        break;
      case "want more info":
        messageHelper(recipientID, {text: "I don't have a huge amount of experience myself but have you thought about talking to friends, family or school counsellors? I think money is a pretty important factor ay ;)? Take a look at this: http://www.payscale.com/research/AU/Country=Australia/Salary Let me know if you want to talk about anything else in the menu."});
        break;
      case "worried about marks":
        messageHelper(recipientID, {text: "TODO"});
        break;
      // layer 2
      // pressured
      case "family":
        quickReply("Yes I have", "No I haven't");
        break;
      case "friends":
        messageHelper(recipientID, "Ah yep. TBH I think you should do what you think you should do, not what your friends do. You will stay good friends with your best friends regardless of where you go. And theres nothing better than making new friends who love what you love where you end up studying. I would have a chat with your family, a school career counsellor, and other people for their thoughts. Always remember you can switch programs/ defer if you change your mind in the future.");
        break;
      case "teachers":
        messageHelper(recipientID, "Oh, interesting. They may have your interests at heart, but tell them your thoughts if you haven't yet. And theres nothing better than making new friends who love what you love where you end up studying. I would ask your family, a school career councillor, and ultimately yourself, what you want to do. Always remember you can switch programs/ defer if you change your mind in the future.");
        break;
      // layer 3
      // pressured
      case "yes i have":
        messageHelper(recipientID, "Ahh, I understand that in some situations you can't simply go against the will of your parents. They will usually have your interests at heart, and they might even have a valid point... maybe you could give their degree a shot for a semester, but change program if you still think its not for you. If you were really set on following your own direction and not their desired one, remember that there are government services to help you in case this causes some serious rifts (for eg in http://www.lawstuff.org.au/sa_law/topics/when-can-I-leave-home)")
        break;
      case "no i haven't":
        messageHelper(recipientID, "I see. Communication is really important in life, and bring up uncomfortable issues is still less painful than putting them off. So I very much think you should tell them your thoughts. If you still disagree, then remember even if you go on to begin studying their prefered option, you're able to transfer and defer if it still doesn't gel for you.");
        break;
      // layer 2
      // Exams
      case "class test":
      	messageHelper(recipientID, "Class tests aren't important. The main goal is to make sure you are keeping up with course content. This is a good time to revise your work and ask your peers and teachers about any areas you don't understand.");
      	break;
      case "half yearlies or trials":
      	messageHelper(recipientID, "The aim of these exams is to simulate the HSC environment. Use this opportunity to check whether your summaries are effective.");
    		break;
    	case "hsc":
    		messageHelper("recipientID, This is the time to do as many past papers as you can. Make sure you cover all areas of your syllabus.");
    		break;

    }
    return true


    return false;
}

function quickReply(recipientId, option1, option2, option3, messageText) {

    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
        method: 'POST',
        json: {
            recipient: {id: recipientId},
            message:{
                text:   messageText,
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
                    }
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
