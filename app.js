var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
var moment = require('moment');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var flash = require('connect-flash');
var helmet = require('helmet');
var cookieSession = require('cookie-session');
const minutes = 1000 * 60
const LOOP_TIME = minutes * 1; 

// SSL setup 
const https = require("https"),
  fs = require("fs");
const options = {
//  key: fs.readFileSync("/home/vipchats/server/sslcert/privkey.pem"),
//  cert: fs.readFileSync("/home/vipchats/server/sslcert/fullchain.pem")
    //cert:fs.readFileSync("/etc/letsencrypt/live/www.vipchats.tech/fullchain.pem"),
    //key:fs.readFileSync("/etc/letsencrypt/live/www.vipchats.tech/privkey.pem")
};

function getDateTime() {
    var date = new Date();
    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;
    return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;
}


app.use(helmet())

let GmailHelper = require('./helpers/GmailHelper');
let MongoDBHelper = require('./helpers/MongoHelper');
let TwilioHelper = require('./helpers/TwilioHelper');

let twilioHelper = new TwilioHelper();
let mongoHelper = new MongoDBHelper(moment);
let gmailHelper = new GmailHelper();
//setInterval(() => { gmailHelper.CheckEmail(); }, LOOP_TIME);


app.set('view engine', 'ejs')
app.set('view options', { layout: false });
app.set('views','./views');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(upload.array());
app.use(cookieParser());
/*
// WARNING:  REAL SERVER USE EXPRESS -SESSION!
app.use(session({
  secret: 'alcossebre 12579',
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false,
            expires: 600000 }
}))
*/

// WARNING:  USE cookieSession for DEVELOPMENT in local!
app.use(cookieSession({
    name: 'session',
    secret: 'alcossebre 12579',
    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.use(flash());
app.use(function(req,res,next){
    res.locals.session = req.session;
    next();
});


app.use(express.static(__dirname + '/views'));
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/js', express.static(__dirname + '/node_modules/popper.js/dist/umd'));
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/css', express.static(__dirname + '/node_modules/font-awesome/css'));
app.use('/fonts', express.static(__dirname + '/node_modules/font-awesome/fonts'));

app.set('trust proxy', 1) // trust first proxy
app.set('port', (process.env.PORT || 8000));
require('./routes/routes.js')(app);

https.createServer(options, app).listen(443);


// Routes for handling 404 requests(unavailable routes)
app.use(function (req, res, next) {
  res.status(404).send("Sorry can't find that!")
});


//User should be authenticated! Redirect him to log in.
app.use('/secured', function(err, req, res, next){
console.log(err);
   res.redirect('/login');
});


app.listen(app.get('port'), function () {
    console.log('Running on Port: ' + app.get('port'));
});





var date=getDateTime();
console.log('----------------------------------------------', date);
console.log('[VipChats] Started ', date);
//console.log('[VipChats] Started ');

emailText='New Reservation Jose Carlos Sancho Hotel Sancho III | Booking.com Check-in: 2018-07-26 Check-out: 2018-07-27 RESERVATION DETAILS Booked On: 2018-07-01 Booking Confirmation Id: 1359576313 Reservation Remarks: booker_is_genius Genius Booker Information: WiFi gratuita: Los clientes Genius disfrutarán de WiFi gratis en el establecimiento. Total Price: 110.00 EUR Commission Payable: 16.50 EUR ROOM - Habitación Doble - 1 o 2 camas Check In Date: 2018-07-26 Check Out Date: 2018-07-27 Guest: Jose Carlos Sancho Number of Guests: 2 Total Price: 110.00 EUR Commission Payable: 16.5 EUR Smoking: No Meal Plan: El desayuno: EUR 8 por persona y noche. Daily Room Rate Breakdown: Date Rate Id Name Price 2018-07-26 68958 (0) 110.00 EUR PAYMENT DETAILS Total Booking Cost: 110.00 EUR Credit Card Type: MC Name: Jose Carlos Sancho Credit Card Number: XXXX-XXXX-XXXX-9510 Expiry: XX23 CVC: 000 BOOKER CONTACT DETAILS Guest Name: Sancho, Jose Carlos Guest Phone: +34 644 56 50 80 Guest Email: jsanch.553708@guest.booking.com Guest Address: Jordi Girona, 31, Barcelona, 08034, Spain The payment card details will be obtainable from The Channel Manager Reservation Search Tool or via the reservation hyperlink below. Click the following link to retrieve reservation payment card details: http://app.siteminder.com/web/f516d5/10883/124777661 Payment card details for this reservation can be obtained by authorised users within The Channel Manager. support@siteminder.com';

 function GetInformation(startWord,endWord, emailText) {
        let start = emailText.indexOf(startWord[0]);
        let end = emailText.indexOf(endWord[0]);
        let substring = emailText.substring(start, end);
        lines= emailText.split('\n');
        data=substring.split(':')[1].split(' ')[1].trim();
        return data;
    }
 function GetInformation2(startWord,endWord, emailText) {
        let start = emailText.indexOf(startWord[0]);
        let end = emailText.indexOf(endWord[0]);
        let substring = emailText.substring(start, end);
        lines= emailText.split('\n');
        data=substring.split(':')[1].trim();
        return data;
    }

