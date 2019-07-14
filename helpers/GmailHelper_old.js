var fs = require('fs');
var readline = require('readline');
const {google} = require('googleapis');
//var google = require('googleapis');
var googleAuth = require('google-auth-library');

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/gmail-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'gmail-nodejs-quickstart.json';

// Load client secrets from a local file.
fs.readFile('client_secret.json', function processClientSecrets(err, content) {
  if (err) {
    console.log('Error loading client secret file: ' + err);
    return;
  }
  // Authorize a client with the loaded credentials, then call the
  // Gmail API.
  authorize(JSON.parse(content), listLabels);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
}

const EmailParserHelper = require('./EmailParserHelper');

let eParser = new EmailParserHelper();

function GmailHelper(mongoHelper, twilioHelper) {
    let auth;
    gmailAPI.setClientSecretsFile('./client_secret.json');
    gmailAPI.authorizeWithToken(accessToken, function(err, oauth) {
        if(err) throw err;
        auth = oauth;
    });

    this.GetNewEmails = function() {
        let options = {
            query: 'from:*.* is:unread'
        };

        gmailAPI.queryMessages(auth, options, function(err, res) {
            if(err) throw err;
            if(res.emails.length === 0) {
                //console.log('-> No New Emails.');
                return;
            }

            res.emails.forEach((email) => {
                let ID = email.id;
                let emailSubject = email.subject;
                let emailText = email.textPlain;

                console.log();
                if(emailSubject.indexOf('Cancellation') > -1) {
                    //Cancellation Email
                    console.log("-> New Person Cancelled.");
                    if(emailSubject.indexOf('Booking.com') > -1) {
                        eParser.Booking_Email(emailText, 'Canceled', (person, booking) => {
                            InsertAndSendCancellation(ID, person, booking);
                        });
                    } else if(emailSubject.indexOf('Expedia') > -1) {
                        eParser.Expedia_Email(emailText, 'Canceled', (person, booking) => {
                            InsertAndSendCancellation(ID, person, booking);
                        });
                    } else if(emailSubject.indexOf('Europlayas') > -1) {
                        eParser.Europlayas_Email(emailText, 'Canceled', (person, booking) => {
                            InsertAndSendCancellation(ID, person, booking);
                        });
                    } else if(emailSubject.indexOf('TheBookingButton') > -1) {
                        eParser.TheBookingButton_Email(emailText, 'Canceled', (person, booking) => {
                            InsertAndSendCancellation(ID, person, booking);
                        });
                    } else {
                        console.log("[Email] Booking From: ???");
                    }
                } else {
                    //Booking Email
                    console.log("-> New Person Booked.");
                    if(emailSubject.indexOf('Booking.com') > -1) {
                        eParser.Booking_Email(emailText, 'Booked', (person, booking) => {
                            InsertAndSendWelcome(ID, person, booking);
                        });
                    } else if(emailSubject.indexOf('Expedia') > -1) {
                        eParser.Expedia_Email(emailText, 'Booked', (person, booking) => {
                            InsertAndSendWelcome(ID, person, booking);
                        });
                    } else if(emailSubject.indexOf('Europlayas') > -1) {
                        eParser.Europlayas_Email(emailText, 'Booked', (person, booking) => {
                            InsertAndSendWelcome(ID, person, booking);
                        });
                    } else if(emailSubject.indexOf('TheBookingButton') > -1) {
                        eParser.TheBookingButton_Email(emailText, 'Booked', (person, booking) => {
                            InsertAndSendWelcome(ID, person, booking);
                        });
                    } else {
                        console.log("[Email] Booking From: ???");
                    }
                }
            });
        });
    };

    function InsertAndSendWelcome(ID, person, booking) {
        mongoHelper.InsertPerson(person, (personResult) => {
            mongoHelper.InsertBooking(person.Phone, booking, (bookingResult) => {
                if(bookingResult.sendSms) {
                    twilioHelper.SendWelcomeMessage(person.Phone, booking.CheckIn);
                }
            });
        });
        MarkAsRead(ID);
    }

    function InsertAndSendCancellation(ID, person, booking) {
        mongoHelper.InsertPerson(person, (personResult) => {
            mongoHelper.CancelBooking(person.Phone, booking, (bookingResult) => {
                if(bookingResult.sendSms) {
                    twilioHelper.SendCancellationMessage(person.Phone);
                }
            });
        });
        MarkAsRead(ID);
    }

    function MarkAsRead(ID) {
        gmail.users.messages.modify({
            userId: 'me', auth: auth,
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
            console.log('Successfully Marked Email '+ ID +' as READ!');
        });
    }
}

module.exports = GmailHelper;
