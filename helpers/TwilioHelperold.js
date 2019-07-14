var dateFormat = require('dateformat');

// Messages are paid by segments and one segment is 160 characters
// One segments cost $0.0833

const Twilio = require('twilio');

let moment = require('moment');
let MongoDBHelper = require('../helpers/MongoHelper');
let mongoHelper = new MongoDBHelper(moment);
let Message = require('../models/Message.js');
const MessageType = require('../models/MessageType.js');

const SendMsg = true;
const SendPromotion= false;

//Spanish Twilio access
let accountSid = 'ACdbdcbd259a54d75b7022cb9d081a0b5c';
let authToken = 'ac85a4f89b342742b69011de96c9da32';
let twilioNumber = '+34955160186';

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

function TwilioHelper() {
    let client = Twilio(accountSid, authToken);

    this.SendWelcomeMessage = function(phoneNumber, checkIn) {
        console.log("Send Welcome Message to: " + phoneNumber);
        var day=dateFormat(checkIn, "dd-mm-yyyy");
//        console.log(day);

// 149 characters without the day
        let welcomeMessage = `Gracias por reservar en el Hotel Sancho III.
Le esperamos para el dia ${day}.
Si tiene alguna consulta puede contactarnos 
al telefono +34964414136`;

        SendMessage(phoneNumber, welcomeMessage,  MessageType.WELCOME);
    };

    this.SendCancellationMessage = function(phoneNumber) {
        console.log("Send Cancellation Message to: " + phoneNumber);

//
        let cancellationMessage = `Hemos cancelado su reserva en el Hotel Sancho III.
Aproveche un descuento en su proxima reserva con
el codigo PROMO10 solo en www.hotelsancho.es`;

        SendMessage(phoneNumber, cancellationMessage, MessageType.CANCEL);
    };

    this.SendPromotionMessage = function(phoneNumber) {
        console.log("Send Promotion Message to: " + phoneNumber);
        let promotionMessage = `PROMOCION 10% descuento!
Reserve en el Hotel Sancho III usando codigo PROMO10 en www.hotelsancho.es
Stop SMS link: http://51.15.193.57:5000/get/cancel/${phoneNumber}`;
        if (SendPromotion){
            SendMessage(phoneNumber, promotionMessage, MessageType.PROMOTION);
        }
    };

    this.SendSubscriptionCanceled = function(phoneNumber) {
        console.log("Send Subscription Canceled Message to: " + phoneNumber);
        let subscriptionCancellationMessage = `Su subscripcion las ofertas del Hotel Sancho III ha sido cancelada con exito.
Subscribirse en link: http://51.15.193.57:5000/get/subscribe/${phoneNumber}`;

        SendMessage(phoneNumber, subscriptionCancellationMessage, MessageType.OTHER);
    };

    this.SendSubscriptionUpdated = function(phoneNumber) {
        console.log("Send Subscription Updated Message to: " + phoneNumber);
        let subscriptionUpdatedMessage = `Bienvenido  de nuevo al servicio de ofertas directas del Hotel Sancho III.
Cancelar SMS: http://51.15.193.57:5000/get/subscribe/${phoneNumber}`;

        SendMessage(phoneNumber, subscriptionUpdatedMessage, MessageType.OTHER);
    };

    this.SendSms = function(phoneNumber,text, msg_type) {
        var date=getDateTime();
        console.log("Sent SMS : " + date + " phone: " + phoneNumber);
        SendMessage(phoneNumber, text, msg_type);
    };

    function SendMessage(phoneNumber, textMessage, msg_type) {
        //logMessage(phoneNumber, textMessage, msg_type);
        if(SendMsg) {
            client.messages.create({
                //to: '+34644565080',
                to: phoneNumber,
                from: twilioNumber,
                body: textMessage,
            }).then((err, message) => {
                if (err) {
                    throw err;
                    console.log(err);
                }
                console.log("[Twilio] Message SENT: " + message.sid + ".");
                //logMessage(phoneNumber, textMessage, msg_type);
            });
        } else {
            console.log("[Twilio] Test Build! SMS not sent");
        }
    }

    function logMessage(phoneNumber, textMessage, msg_type){
        // 649806826
        let msg = new Message();
        msg.phone = phoneNumber;
        msg.text = textMessage;
        msg.type = (msg_type!=null)?msg_type:0;
        mongoHelper.InsertMessage(msg, function(result){
            return true;
        });
    }
}

module.exports = TwilioHelper;
