var express = require('express')
var bodyParser = require('body-parser')
var request = require('request')
var app = express()


app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
})

// Index route
app.get('/', function (req, res) {
    res.send('Hello world, I am a chat bot :)')
})

var token = process.env.FB_ACCESS_TOKEN;
var token_verifi = process.env.FB_VERYFI_TOKEN;

// for Facebook verification
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === token_verifi) {
       
       var js = JSON.stringify(req.body);
       res.send('Hello world, I am a chat bot')
       res.send (js);

    }
    res.send('Error, wrong token')
})

/*v2*/
// All callbacks for Messenger will be POST-ed here
app.post("/webhook", function (req, res) {

  // Make sure this is a page subscription
  if (req.body.object == "page") {
    // Iterate over each entry
    // There may be multiple entries if batched
    req.body.entry.forEach(function(entry) {
      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        if (event.postback) {
          processPostback(event);
        }
       else if (event.message) {
         console.log(JSON.stringify(event.message));
         if( event.message.quick_reply){
           var quick_reply = event.message.quick_reply;
           var senderId  = event.sender.id;
           var payload = quick_reply.payload;
           console.log(payload);
           if (payload){
             processPayload(senderId, payload);
           }
         }else {
        
            processMessage(event);
         }
        }
        
      });
    });

    res.sendStatus(200);
  }
},  function(error, response, body) {
      if (error) {
          console.log('Error sending messages: ', error)
      } else if (response.body.error) {
          console.log('Error: ', response.body.error)
      }
  }
);

//sends message to User on FBMessenger
function sendMessageToFBMessenger(recipientId, message) {
  request({
    url: "https://graph.facebook.com/v2.6/me/messages",
    qs: {access_token: process.env.FB_ACCESS_TOKEN},
    method: "POST",
    json: {
      recipient: {id: recipientId},
      message: message,
    }
  },  function(error, response, body) {
      if (error) {
          console.log('Error sending messages: ', error)
      } else if (response.body.error) {
          console.log('Error: ', response.body.error)
      }
  });
}
//function get firstname and last name 
function getFullNameCUS(senderId){
    var fullname = "";
    try{
        
        request({
              url: "https://graph.facebook.com/v2.6/" + senderId,
              qs: {
                access_token: token,
                fields: "first_name,last_name"
              },
              method: "GET"
            }, function(error, response, body) {
              
              if (error) {
                console.log("Error getting user's name: " +  error);
              } else {
                var bodyObj = JSON.parse(body);
                var first_name = bodyObj.first_name;
                var lastname = bodyObj.last_name;
                fullname =   first_name; 

              }});
        console.log ("jsbody", fullname);
    } catch( err){
        console.log("error call getFullNameCUS ",err );
    }
    
    return fullname;
}

// function to echo back messages 
function processPostback(event) {
  var senderId = event.sender.id;
  var payload = event.postback.payload;
  
  console.log('call postback: ', "processPostback");

  if (payload === "Greeting") {
    // Get user's first name from the User Profile API
    // and include it in the greeting
    request({
      url: "https://graph.facebook.com/v2.6/" + senderId,
      qs: {
        access_token: token,
        fields: "first_name,last_name"
      },
      method: "GET"
    }, function(error, response, body) {
      var greeting = "";
      if (error) {
        console.log("Error getting user's name: " +  error);
      } else {
        var bodyObj = JSON.parse(body);
        
        var message = greeting + "My name is Chat Bot. What movie would you like to know about?";
        //sendMessageToFBMessenger(senderId, {text: message});
        /*set send mesage postback event*/
        sendPostBackWellcome (senderId, body);
      }
    });
  } else {
      // call funciotn process pageload
      processPayload(senderId,payload);
  }
}

//function to echo message (text )
function processMessage(event) {
  if (!event.message.is_echo) {
    var message = event.message;
    var senderId = event.sender.id;
    console.log("Received message from senderId: " + senderId);
    console.log("Message is: " + JSON.stringify(message));

    
    // You may get payload in text 
   
    
    
    // You may get a text or attachment but not both
     
    if (message.text) {
      var formattedMsg = message.text.toLowerCase().trim();

      // If we receive a text message, check to see if it matches any special
      // keywords and send back the corresponding movie detail.
      // Otherwise, search for new movie.
   
       switch (message.text) {
          case 'generic':
            sendGenericMessage(senderId);
            break;

          default:
             sendMessageToFBMessenger(senderId, {text: message.text});
        }
      
    } else if (message.attachments) {
      sendMessageToFBMessenger(senderId, {text: "Sorry, I don't understand your request."});
    }
  }
}
function sendGenericMessage(sender) {
    messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Ai Chat Bot Communities",
                    "subtitle": "Communities to Follow",
                    "image_url": "http://1u88jj3r4db2x4txp44yqfj1.wpengine.netdna-cdn.com/...",
                    "buttons": [{
                        "type": "web_url",
                        "url": "https://www.facebook.com/groups/aic...",
                        "title": "FB Chatbot Group"
                    }, {
                        "type": "web_url",
                        "url": "https://www.reddit.com/r/Chat_Bots/",
                        "title": "Chatbots on Reddit"
                    },{
                        "type": "web_url",
                        "url": "https://twitter.com/aichatbots",
                        "title": "Chatbots on Twitter"
                    }],
                }, {
                    "title": "Chatbots FAQ",
                    "subtitle": "Aking the Deep Questions",
                    "image_url": "https://tctechcrunch2011.files.wordpress.com/...",
                    "buttons": [{
                        "type": "postback",
                        "title": "What's the benefit?",
                        "payload": "Chatbots make content interactive instead of static",
                    },{
                        "type": "postback",
                        "title": "What can Chatbots do",
                        "payload": "One day Chatbots will control the Internet of Things! You will be able to control your homes temperature with a text",
                    }, {
                        "type": "postback",
                        "title": "The Future",
                        "payload": "Chatbots are fun! One day your BFF might be a Chatbot",
                    }],
                },  {
                    "title": "Learning More",
                    "subtitle": "Aking the Deep Questions",
                    "image_url": "http://www.brandknewmag.com/wp-cont...",
                    "buttons": [{
                        "type": "postback",
                        "title": "AIML",
                        "payload": "Checkout Artificial Intelligence Mark Up Language. Its easier than you think!",
                    },{
                        "type": "postback",
                        "title": "Machine Learning",
                        "payload": "Use python to teach your maching in 16D space in 15min",
                    }, {
                        "type": "postback",
                        "title": "Communities",
                        "payload": "Online communities & Meetups are the best way to stay ahead of the curve!",
                    }],
                }]  
            } 
        }
    }
  
    
    sendMessageToFBMessenger(sender, messageData);
}

// process wellcome 
function sendPostBackWellcome (senderId, body){
    
  try{

 console.log('call sendPostBackWellcome: ', "sendPostBackWellcome");
  var bodyObj = JSON.parse(body);
  var fullname = getFullNameCUS(senderId);
  var name = bodyObj.first_name;
  var greeting = "Xin chào bạn " + name +" "+bodyObj.last_name  + ". ";
  
 // var greeting = "Xin chào bạn " + fullname  + ". ";
        
  var messageHello = greeting + " :) Mình là SupportBot. Rất hân hạnh được hỗ trợ bạn. Bạn có cần hỗ trợ về thông tin gì không?";
  var  messageData = {
         "attachment":{
          "type":"image",
          "payload":{
            "url":"http://pngimg.com/uploads/hello/hello_PNG45.png"
          }
        }
      }
  
    // send image hello 
    
  request({
      url: "https://graph.facebook.com/v2.6/me/messages",
      qs: {access_token: process.env.FB_ACCESS_TOKEN},
      method: "POST",
      json: {
        recipient: {id: senderId},
        message: messageData,
      }
    },  function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', response.body.error)
        } else {
            //send question support
            // send quick set button
            var quicksetButton  = {
                  "text":messageHello,
                  "quick_replies":[
                    {
                      "content_type":"text",
                      "title":"Có",
                      "payload":"yes_support_welcome"
                    },
                    {
                      "content_type":"text",
                      "title":"Không",
                      "payload":"no_support_welcome"
                    }
                  ]
                }
            sendMessageToFBMessenger(senderId, quicksetButton);
            //end 
        }
    });
  } catch (err)  {
      console.log('error sendPostBackWellcome: ',err);
  }
  
}
//
// function process PageLoad 
function processPayload (senderId,payload){
    try 
    {
        switch (payload) {
        case "yes_support_welcome":

          //policyInfo.sayhello();
            //show log
            console.log("start processPayload action:", "yes_support_welcome" );
            var messageText = "SupportBot có thể giúp bạn các vấn đề nào sao đây?"
            var messageData= {
                "attachment":{
                    "type":"template",
                    "payload":{
                        "template_type":"button",
                        "text":messageText,
                        "buttons":[
                                {
                                    "type":"postback",
                                    "title":"Hợp đồng và phí",
                                    "payload":"op_policy"
                                },
                                {
                                    "type":"postback",
                                    "title":"Mua thêm hợp đồng",
                                    "payload":"op_buy"
                                }
                        ]
                    }
                }   
            };
            
            
            // send quick set button
          var quicksetButton  = {
                "text":messageText,
                "quick_replies":[
                  {
                    "content_type":"text",
                    "title":"Hợp đồng và phí",
                    "payload":"op_policy"
                  },
                  {
                    "content_type":"text",
                    "title":"Mua thêm hợp đồng",
                    "payload":"op_buy"
                  }
                ]
              };
            
            sendMessageToFBMessenger(senderId, quicksetButton);
            break;
        case "no_support_welcome":
            //show log
            console.log("start processPayload action:", "no_support_welcome" );
            
            
            
            break;
        default:
            // To do
            sendMessageToFBMessenger(senderId, {text: "Sorry, I don't understand your request."});
            break;
        }
    } catch (err){
        //show error
        console.log("error processPayload", err);
    }
    
}
