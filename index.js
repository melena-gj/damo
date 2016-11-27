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
                messageHelper(event.sender.id, {text: "Sorry I don't understand what you're saying. Please use the menu buttons to talk to me."});
            }
        } else if (event.postback) {
    		//ignore the initial "Get started" button
    			if (event.postback.payload==="USER_DEFINED_PAYLOAD") {
        		messageHelper(event.sender.id,  {text: "Hi! I'm Damo, I graduated highschool a few years ago, and I've learnt a lot since then. I'm here to help you with HSC stress. Check out the options in the menu below and if you want to talk about one give it a click."});
    			} else if (!banterTheUser(event.sender.id, event.postback.payload)) {
                messageHelper(event.sender.id, {text: "Sorry I don't understand what you're saying. Please use the menu buttons to talk to me."})
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
        quickReply(recipientID, "Class Test", "Trials", "HSC", "Exams are inevitable during HSC, but it's important to remember they are just another part of life. Which stage of exams are you anticipating?");
        break;
      case "study":
        quickReply(recipientID, "I have ages", "Need tips FAST!", "I'm good", "You will need to study consistently throughout this year if you want to avoid cramming. But it may be too late for this. Which stage are you at right now?");
        break;
      case "pressure":
        // TODO make this four (missing the yourself option)
      	quickReply(recipientID, "Family", "Friends", "Teachers", "Ahh that's a shame. It's quite common as well unfortunately. Remember to ask people for help and advice whenever you need it by the way. Who are you feeling pressured from?");
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
        messageHelper(recipientID, {text: "Fair enough. It's pretty early in your life to have this figured out. To be honest, to get inspiration, a good start is to talk to people, whether its family, friends, or school counsellors."});
      	messageHelper(recipientID, {text: "A good place to get started would be this career quiz :) http://joboutlook.gov.au/careerquiz.aspx"});
        break;
      // layer 3
      // careers
      case "yeah":
        messageHelper(recipientID, {text: "That's normal, but theres not point worrying about something if that worry doesn't change anything 😛 ."});
      	messageHelper(recipientID, {text: "Remember that there are other pathways into a course if you don't get the HSC marks. Otherwise, just approach your studies calmly, methodically, and don't be worried to ask friends and family for help."});
        break;
      case "nah":
        messageHelper(recipientID, {text: 'Alright, anything else you wanted to chat about mate? Click any of the menu options if there is.'});
        break;
      case "i'm having doubts":
        quickReply(recipientID, "Want more info", "Nah", "",
        "Fair enough, It's pretty ridiculous that they make you make such a big decision so early on in your life. But you know what, I changed degrees 2 times mate, and plenty of my friends too :). Actually about 50% of students change their degree during their time at uni. Did you want more info?");
        break;
      case "want more info":
        messageHelper(recipientID, {text: "I don't have a huge amount of experience myself but have you thought about talking to friends, family or school counsellors?"});
        	messageHelper(recipientID, {text: "I think money is a pretty important factor ay ;)? Take a look at this: http://www.payscale.com/research/AU/Country=Australia/Salary Let me know if you want to talk about anything else in the menu."});
        break;
      case "worried about marks":
        messageHelper(recipientID, {text: "Oh, well at the very worst, if you don't get the marks you need, there are other pathways into the courses you want. If it puts your mind at ease, take some time research some of these pathways for the course you want."});
        	messageHelper(recipientID, {text: "Otherwise, remember to put everything in perspective, and approach your exams calmly and methodically."});
        break;
      // layer 2
      // pressured
      case "family":
        quickReply(recipientID, "Yes I have", "No I haven't", "I should", "Ahhk, have you already discussed this with them?");
        break;
      case "friends":
        messageHelper(recipientID, {text: "Ah yep. TBH I think you should do what you think you should do, not what your friends do. You will stay good friends with your best friends regardless of where you go. And theres nothing better than making new friends who love what you love where you end up studying."});
        	messageHelper(recipientID, {text: "I would have a chat with your family, a school career counsellor, and other people for their thoughts. Always remember you can switch programs/ defer if you change your mind in the future."});
        break;
      case "teachers":
        messageHelper(recipientID, {text: "Oh, interesting. They may have your interests at heart, but tell them your thoughts if you haven't yet. And theres nothing better than making new friends who love what you love where you end up studying."});
        	messageHelper(recipientID, {text: "I would ask your family, a school career councillor, and ultimately yourself, what you want to do. Always remember you can switch programs/ defer if you change your mind in the future."});
        break;
      // layer 3
      // pressured
      case "yes i have":
        messageHelper(recipientID, {text: "Ahh, I understand that in some situations you can't simply go against the will of your parents. They will usually have your interests at heart, and they might even have a valid point..."});
        messageHelper(recipientID, {text: "maybe you could give their degree a shot for a semester, but change program if you still think its not for you."});
        	messageHelper(recipientID, {text: "If you were really set on following your own direction and not their desired one, remember that there are government services to help you in case this causes some serious rifts (for eg in http://www.lawstuff.org.au/sa_law/topics/when-can-I-leave-home)"})
        break;
      case "no i haven't":
        messageHelper(recipientID, {text: "I see. Communication is really important in life, and bring up uncomfortable issues is still less painful than putting them off. "});
        messageHelper(recipientID, {text: "So I very much think you should tell them your thoughts. If you still disagree, then remember even if you go on to begin studying their prefered option, you're able to transfer and defer if it still doesn't gel for you."});
        break;
      case "i should":
      	messageHelper(recipientID, {text: "Yes you should :D Pick a time that's suitable for you and go for it."});
      // layer 2
      // Exams
      case "class test":
      	messageHelper(recipientID, {text: "Class tests aren't important. The main goal is to make sure you are keeping up with course content. This is a good time to revise your work and ask your peers and teachers about any areas you don't understand."});
      	break;
      case "trials":
      	messageHelper(recipientID, {text:"The aim of these exams is to simulate the HSC environment. Use this opportunity to check whether your summaries are effective."});
    		break;
    	case "hsc":
    		messageHelper(recipientID,{text: "This is the time to do as many past papers as you can. Make sure you cover all areas of your syllabus."});
    		break;
    	// layer 2
    	// Study
    	case "i have ages":
    		quickReply(recipientID, "Assignment/projects", "Study habits", "Notetaking", "Since you have plenty of time to prepare, there are many things you can implement to aid your learning and long term memory.");
    		break;
    	case "need tips fast!":
    		messageHelper(recipientID, {text: "Here are some things you should try: Ask a friend for their study notes, ask a teacher for more information, read the syllabus points being assessed, watch youtube videos on the topic, skim your textbook, understand formulas."});
    		break;
    	case "i'm good":
    		messageHelper(recipiendID, {text: "Good on you :D"});
    		break;
    	//layer 3
    	//Study
    	case "assignment/projects":
    		messageHelper(recipientID, {text: "Assignments and projects are a useful task to develop your work ethic and goal management. What sort of help do you need?"});
    		break;
    	case "study habits":
    		messageHelper(recipientID, {text: "There are a number of ways you can improve your work ethic and develop a disciplined approach to your studies. These are some of the areas I would reccomend."});
    		break;
    	case "notetaking":
    		messageHelper(recipientID, {text: "Keeping notes throughout the year will give you a good basis for revision later. Here are some tips for taking effective notes. Be consistent: use the same type of book or notepad throughout the year. "});
    		messageHelper(recipientID, {text: "Keep track of the section of syllabus your notes are relevant to. At the end of each week, skim over your notes and highlight important sections to help you access the content more efficiently towards the end of the year or before an exam. "});
    			messageHelper(recipientID, {text: "Every few weeks, skim your notes and type up a brief summary of the topics. These super-condensed summaries of your work will be perfect to trigger your memory towards the end of the year. "});
    				messageHelper(recipientID, {text: "Annotate them with the sections of syllabus they refer to. Good Luck!"});
    		break;


        default:
            return false;

    }
    return true
}

function quickReply(recipientId, option1, option2, option3, messageText) {

    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
        method: 'POST',
        json: {
            recipient:      {id: recipientId},
            sender_action:  "typing_on",
            message:{
                text:   messageText,
                quick_replies:[
                    {
                        content_type:   "text",
                        title:          option1,
                        payload:        option1
                    },
                    {
                        content_type:   "text",
                        title:          option2,
                        payload:        option2
                    },
                    {
                        content_type:   "text",
                        title:          option3,
                        payload:        option3
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
