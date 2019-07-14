var fs = require('fs');
var moment = require('moment');
var readline = require('readline');
var {google} = require('googleapis');
var OAuth2 = google.auth.OAuth2;

const EmailParserHelper = require('./EmailParserHelper');
let eParser = new EmailParserHelper();

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/gmail-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/gmail.modify'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'gmail-nodejs-quickstart.json';

let MongoDBHelper = require('./MongoHelper');
let TwilioHelper = require('./TwilioHelper');
let twilioHelper = new TwilioHelper();
let mongoHelper = new MongoDBHelper(moment);


function GmailHelper(){
// comment the function declaration below to run it manuall using node GmailHelper.js
this.CheckEmail = function() {
// Load client secrets from a local file.
  fs.readFile('/home/vipchats/server/client_secret.json', function processClientSecrets(err, content) {
    if (err) {
      console.log('Error loading client secret file: ' + err);
      return;
    }
  // Authorize a client with the loaded credentials, then call the
  // Gmail API.
   authorize(JSON.parse(content), Gmail);
  //authorize(JSON.parse(content), listLabels);
  });
 }//CheckEmail

function authorize(credentials, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

  google.options({
    auth: oauth2Client,
   })


  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      console.log("Error: missing token");
      return
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback();
      //callback(oauth2Client);
    }
  });
}


/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listLabels() {
  var gmail = google.gmail('v1');
  gmail.users.labels.list({
    userId: 'me',
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    var labels = response.data.labels;
    if (labels.length == 0) {
      console.log('No labels found.');
    } else {
      console.log('Labels:');
      for (var i = 0; i < labels.length; i++) {
        var label = labels[i];
        console.log('- %s', label.name);
      }
    }
  });
}

/************************************************/
function Gmail() {

  //console.log("getting emails...");

  var gmail = google.gmail('v1');
  gmail.users.messages.list({
    userId: 'me',
    q: "in:inbox is:unread",
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    var messages = response.data.messages;
    //console.log(messages); 

   if(err) throw err;
   if((messages === undefined)||(messages === null)) {
           //console.log('-> No New Emails.');
           return;
   }

   if (messages.length == 0) {
      //console.log('No messages found.');
   } else {
     // console.log('checking messages, found: ', messages.length);
      for (var i = 0; i < messages.length; i++) {
        var msg = messages[i];
          params: {
           }

        let ID=msg.id;
        //console.log('messages:', msg.id);

        gmail.users.messages.get({ userId: 'me',id:msg.id}, function(err, response) {
          if (err) {
             // If you get an error here TypeError: First argument must be a string, Buffer,
             // it is because the message is not on the new format from siteminder like booking.com   
             // This is an error caused on the call response.data.payload.parts[0].body.data;
              console.log('Gmail users get The API returned an error: ' + err);
              MarkAsRead(ID);
              return;
          }

         //HTML 
          var headers=response.data.payload.headers;
          //console.log(headers[i]['name']);
          var validemail=false;
	  for(var i = 0; i < headers.length;i++){
             if (headers[i]['name']=='From'){
                  //console.log(headers[i]);
                  if (headers[i]['value']=='<noreply@app.siteminder.com>'){
                      validemail=true;
                  }     
             }		
          }
          if (validemail){
          //	process.exit(0);	
	  	message_raw = response.data.payload.parts[0].parts[0].body.data; //HTML
          	buff = new Buffer(message_raw, 'base64');
          	msgbody3 = buff.toString();
          	var msgbody2=msgbody3.replace(/<[^>]+>/g, '\r');
          	var msgbody=msgbody2.replace(/\s+/g, ' ');
          	//console.log(msgbody);
          	//process.exit(0);	

          	if (msgbody.indexOf('New Reservation') > -1) {     
         	//Booking Email
            	console.log("-> New Booking.");
            	if(msgbody.indexOf('Booking.com') > -1) {
                        eParser.Booking_Email(msgbody, 'Booked', (person, booking) => {
	//          process.exit(0);	
                            InsertAndSendWelcome(ID, person, booking);
             	});
           	 } 
          	}//new booking email

          	// Cancellation 
          	if (msgbody.indexOf('Reservation Cancellation') > -1) {
             		console.log("-> New Person Cancelled.");
             		if(msgbody.indexOf('Booking.com') > -1) {
                      		eParser.Booking_Email(msgbody, 'Canceled', (person, booking) => {
                      		InsertAndSendCancellation(ID, person, booking);
                	});
             		} 
          	}//Cancellation
 
        }//valid email

        MarkAsRead(ID);

        });
      }
    }// if messages.length
  });
        return;
  };//Gmail

    function InsertAndSendWelcome(ID, person, booking) {
        mongoHelper.InsertPerson(person, (personResult) => {
            mongoHelper.InsertBooking(person.Phone, booking, (bookingResult) => {
                if(bookingResult.sendSms) {
                    twilioHelper.SendWelcomeMessage(person.Phone, booking.CheckIn);
                }
            });
        });
    }

    function InsertAndSendCancellation(ID, person, booking) {
        mongoHelper.InsertPerson(person, (personResult) => {
            mongoHelper.CancelBooking(person.Phone, booking, (bookingResult) => {
//                if(bookingResult.sendSms) {
                    twilioHelper.SendCancellationMessage(person.Phone);
//              }
            });
        });
    }

    function MarkAsRead(ID) {
         var gmail = google.gmail('v1');
            gmail.users.messages.modify({
            userId: 'me', 
            id: ID,
            resource: {
                addLabelIds: [],
                removeLabelIds: ['UNREAD']
            }
        }, function(err) {
            if(err) {
                console.log("ERROR: " + err);
                return;
            }
//            console.log('Successfully Marked Email '+ ID +' as READ!');
        });
    }//MarkAsRead
//}

}
module.exports = GmailHelper;

