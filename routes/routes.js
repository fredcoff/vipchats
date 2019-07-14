let util = require('util');
let moment = require('moment');
let MongoDBHelper = require('../helpers/MongoHelper');
let mongoHelper = new MongoDBHelper(moment);
let TwilioHelper = require('../helpers/TwilioHelper');
let twilioHelper = new TwilioHelper();
let Person = require('../models/Person.js');
let Message = require('../models/Message.js');
let Hotel = require('../models/Hotel.js');
const MessageType = require('../models/MessageType.js');
let ObjectId = require('mongodb').ObjectID;
let fs = require('fs');
let md5 = require('md5');
const exec = require('child_process').exec;
//var popupS = require('popups');

/*
 * Admin User list
 */
var adminUsers =[]
// Authentificate vipchats website:
var hotelsancho ={username:'hotelsancho3@gmail.com',password:'alcossebre'}
var admin ={username:'jcsanchop@gmail.com',password:'alcossebre'}
adminUsers.push(admin);

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



function sslpage(req,res,next){

   //res.redirect('https://' + req.headers.host + req.url);
   next();
}

function smartErr( message , req, res ) {
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        // send your xhr response here
        var err = new Error(message);
        next(err);  //Error, trying to access unauthorized page!
        return;
    } else {
        res.redirect("/signup_renewal");
        return;
    }
}

function checkSignIn(req, res, next){
    // This is for hotel user!
    // For admin user, there is "checkAdmin" function in routes_admin.js

    if (req.session.user == null){
      var err = new Error("Not logged in!");
      next(err);  //Error, trying to access unauthorized page!
      return;
    }
    if (req.session.user.hotelid == null) {
        var err = new Error("You are not hotel account!");
        next(err);
        return;
    }


    if( (new Date(req.session.user['ExpirationDate_Message'])).getTime() < (new Date()).getTime()) {
        if( (new Date(req.session.user['ExpirationDate_Sign'])).getTime() < (new Date()).getTime()) {
            console.log("Your Trial period is expired! ");
            smartErr("Your Trial period is expired! Please subscribe to use this account!", req, res);
            return;
        }
    }
    next();
}

function checkSignatureService(req, res, next){
    // This function must be called after checkSignin
    if( (new Date(req.session.user['ExpirationDate_Sign'])).getTime() > (new Date()).getTime()) {
        next();
    } else {
        const err = new Error("Your didn't subscribed to Signature Service!");
        next(err);
        return;
    }
}

function checkMessageService(req, res, next){
    // This function must be called after checkSignin
    if( (new Date(req.session.user['ExpirationDate_Message'])).getTime() > (new Date()).getTime()) {
        next();
    } else {
        const err = new Error("Your didn't subscribed to Message Service!");
        next(err);
        return;
    }
}

function isset(obj){
    if( typeof obj =="undefined")
        return false;
    if( obj == '')
        return false;
    return true;
}
function issetmap(map){
    if( typeof map =="undefined")
        return false;
    for(key in map){
        return true;
    }
    return false;
}
function NoCachePage(res){
    res.header('Cache-Control' , 'no-cache, no-store, must-revalidate' );
    res.header('Pragma' , 'no-cache' );
    res.header('Expires' , '0' );
}







module.exports = function (app) {
/*
// For REAL SERVER
app.get('*',function (req, res, next) {
    if (req.secure){
        return next();
    }
    res.redirect('https://www.vipchats.tech' + req.url);
});
// route for user logout
app.get('/logout', (req, res, next) => {
    req.session.destroy(function(){
        //console.log("user logged out.")
    });
    res.redirect('/login');
});
*/

// For DEVELOPMENT in local
app.get('*',function (req, res, next) {
    return next();
});
// route for user logout
app.get('/logout', (req, res, next) => {
    req.session = null;
    res.redirect('/login');
});




// file is included here:
eval(fs.readFileSync('routes/routes_hotelsetup.js')+'');
eval(fs.readFileSync('routes/routes_signinup.js')+'');
eval(fs.readFileSync('routes/routes_admin.js')+'');
eval(fs.readFileSync('routes/routes_client.js')+'');


app.get('/', function (req, res, next) {
    req.flash('msg1', 'Flash is back!')
    res.render('index');
});
//***** ***** ***** ***** *****  POST   ***** ***** ***** ***** *****//


app.post('/subscriptions', function (req, res, next) {

               // const flashMessages = res.locals;
               // console.log('flash',flashMessages);

                 
	 	//console.log('subscription post ', req.body.inputphone, req.body.inputsubscribe);
                if (!req.body.inputphone){
              	   console.log('not input phone ');
 
                   //popupS.alert({
                   //  content: 'Hello World!'
                   //});

                   res.render('subscriptions', {message: "Please enter guest phone"});
                }else{ 
                   req.body.inputphone='+34'+req.body.inputphone;  
              	   console.log('input phone: ', req.body.inputphone, req.body.inputsubscribe);
    		   let phone = req.body.inputphone;
                   let msgresult='';
                   if (req.body.inputsubscribe == 'subscribe'){ 
    		   	mongoHelper.ActivateSubscription(phone, (result) => {
                                console.log('Updating:',result.results.message.documents[0].nModified);
                                if (result.results.message.documents[0].nModified==0){
                                   res.render('subscriptions', {message:'Not found!'});
                                }else{
                                   res.render('subscriptions', {message:'Sucess'});
                                }
        	//		res.send(result);
    		   	});
                   }else{
    		   	mongoHelper.CancelSubscription(phone, (result) => {
                                let msgresult='';
                                if (result.results.message.documents[0].nModified==0){
                                   res.render('subscriptions', {message:'Not found!'});
                                }else{
                                   res.render('subscriptions', {message:'Sucess'});
                                }
                                //res.render('subscriptions', {message: msgresult});
        	//		res.send(result);
    		   	});
                   }
                  // res.render('subscriptions', {message: msgresult});
                   
		}
	});
app.post('/sms', checkSignIn, checkMessageService, function (req, res, next) {
	 	//console.log('subscription post ', req.body.inputphone, req.body.inputtext);
        if (!req.body.inputphone || !req.body.inputtext){
           console.log('not input phone or text ');
           res.render('sms', {message: "<div class='alert alert-danger'>Please enter guest phone or text</div>"});
           return;
        }else {
            // console.log('input phone: ', req.body.inputphone, req.body.inputtext);
            let phone = req.body.inputphone;
            let text = req.body.inputtext;
            let msg_type = 0;
            if (req.body['inputmsgtype'] == 'confirm_msg')
                msg_type = MessageType.CONFIRM;
            if (req.body['inputmsgtype'] == 'cancel_msg')
                msg_type = MessageType.CANCEL;

            twilioHelper.SendSms(phone,text,msg_type, req.session.user.hotelid,  (err, message)=>{
               if(err){
                   let e_msg = err['message']!=null?err['message']:"Unknown Error";
                   e_msg = err===1?"Test Mode":e_msg;
                   res.render('sms', {message: "<div class='alert alert-danger'>"+e_msg+"</div>", previous_number:req.body.inputphone});
               } else{
                   res.render('sms', {message: "<div class='alert alert-success'>SMS sent successfully !</div>", previous_number:req.body.inputphone});
               }
            });
        }
	});

//***** ***** ***** ***** *****   GET   ***** ***** ***** ***** *****//

app.get('/flash', function(req, res){
  // Set a flash message by passing the key, followed by the value, to req.flash().
  res.send(req.flash('msg1'));
});






app.get('/secured',checkSignIn, function (req, res, next) {
		//console.log('secured user:',req.session.user);
		res.render('secured',{id: req.session.user.id});
	});


app.get('/subscriptions',checkSignIn, function (req, res, next) {
		console.log('subscriptions secured user:',req.session.user);
		res.render('subscriptions',{id: req.session.user.id,message:''});
	});

app.get('/sms',checkSignIn, checkMessageService, function (req, res, next) {
		//console.log('sms secured user:',req.session.user);
        if (req.session.user.hotelid == null) {
            var err = new Error("You are not hotel account!");
            next(err);
            return;
        }
        mongoHelper.GetHotelByParams({'_id': new ObjectId( req.session.user.hotelid ) }, function(result){
            if (!result.length) {
                var err = new Error("Can't find your hotel!");
                next(err);
                return;
            }
            res.render('sms',{id: req.session.user.id });
        });
	});
app.get('/sms_sent/:phone',checkSignIn, checkMessageService, function (req, res, next) {
        //console.log('sms secured user:',req.session.user);
        let params = {}
        if( req.params.phone != 'ALL' ){
            params = {phone:req.params.phone};
        }
        if (req.session.user.hotelid == null) {
            var err = new Error("You are not hotel account!");
            next(err);
            return;
        }
        params['hotelid'] = req.session.user.hotelid;
        mongoHelper.GetMessageByParams( params , (result)=>{
            res.render('sms_sent',{id: req.session.user.id, phone: req.params.phone, sentmsgs:result });
        });
    });

app.get('/statistics',checkSignIn, function (req, res, next) {
		//console.log('secured user:',req.session.user);
		res.render('statistics',{id: req.session.user.id});
	});


app.get('/get/booking/all', function(req, res) {
    mongoHelper.ListAllBookings((result) => {
        res.send(result);
    });
});

app.get('/get/bookings/:phone', function(req, res) {
    let phone = req.params.phone;
    mongoHelper.ListClientBookings(phone, (result) => {
        res.send(result);
    });
});

app.get('/get/promotions', function(req, res) {
    let today = moment().format('DD-MM-YYYY');
    let nextYear = moment().clone().add(1, 'year').format('DD-MM-YYYY');

    mongoHelper.ListPromotionBookings(today, (results) => {
        results.forEach((result) => {
            mongoHelper.UpdateSendPromotion(result, nextYear, () => {
                twilioHelper.SendPromotionMessage(result.phone);
            });
        });

         res.send(results);
    });
});

app.get('/get/cancel/:phone', function(req, res){
    let phone = req.params.phone;

    mongoHelper.UpdateSubscription(phone, false, (result) => {
        twilioHelper.SendSubscriptionCanceled(phone);
        res.send("Subscription Canceled! <p>" + result);
    });
});

app.get('/get/subscribe/:phone', function(req, res){
    let phone = req.params.phone;

    mongoHelper.UpdateSubscription(phone, true, (result) => {
        twilioHelper.SendSubscriptionUpdated(phone);
        res.send("Subscription Updated! <p>" + result);
    });
});

//***** ***** ***** ***** *****   STATISTICS   ***** ***** ***** ***** *****//
app.get('/get/stats/promo', function(req, res) {
    let lastYear = moment().clone().subtract(1, 'year').year();
    let thisYear = moment().year();

    mongoHelper.CountPromos(lastYear, (lastYearPromo) => {
        mongoHelper.CountPromos(thisYear, (thisYearPromo) => {
            let data = {
                datasets: [{
                    data: [ lastYearPromo[0], thisYearPromo[0], lastYearPromo[1], thisYearPromo[1] ],
                    backgroundColor: ['#ff6384', '#36a2eb', '#ff6384', '#36a2eb']
                }],
                labels: [
                    'Agencies - ' + lastYear, 'Agencies - ' + thisYear,
                    'Hotel Site - ' + lastYear, 'Hotel Site - ' + thisYear,
                ]
            };
            res.send(data);
        });
    });
});

app.get('/get/stats/count', function(req, res) {
    let beginDate = moment().clone().startOf('month').subtract(1, 'year').toISOString();
    let endDate = moment().clone().endOf('month').subtract(1, 'year').toISOString();

    mongoHelper.MonthlyPromos(beginDate, endDate, (result) => {
        let data = {
            datasets: [{ data: [ ] }],
            labels: [ ]
        };

        let array = [];
        result.forEach((r) => {
            let day = r.Bookings.checkIn.split('-')[0];
            if(array[day]) { array[day]++; }
            else { array[day] = 1; }
        });

        for(let i = 1; i < 31; i++) {
            if(array[i]) { data.datasets[0].data.push({ x: i, y: array[i] }); }
            else { data.datasets[0].data.push({ x: i, y: 0 }); }
            data.labels.push(i);
        }

        res.send(data);
    });
});


app.get('/get/stats/bookings', function(req, res) {
    mongoHelper.CountBookedFrom((bookings) => {
        let data = {
            datasets: [{
                data: bookings,
                backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe', '#ffce56']
            }],
            labels: [ 'Booking.com', 'Expedia', 'Europlayas', 'Hotel Site' ]
        };
        res.send(data);
    });
});

app.get('/get/stats/subscriptions', function(req, res) {
    mongoHelper.CountSubscriptions((subs) => {
        let data = {
            datasets: [{
                data: subs,
                backgroundColor: ['#ff6384', '#36a2eb']
            }],
            labels: [ 'Subscribed', 'Unsubscribed' ]
        };
        res.send(data);
    })
});

//***** ***** ***** ***** *****   DELETE   ***** ***** ***** ***** *****//
// https://www.vipchats.tech/delete/all 

app.get('/delete/clients/all', function(req, res) {
    mongoHelper.DeleteAllClients((result) => {
        res.send(result);
    });
});

app.get('/delete/bookings/all', function(req, res) {
    mongoHelper.DeleteAllBookings((result) => {
        res.send(result);
    });
});

app.get('/delete/all', function(req, res) {
    mongoHelper.DeleteAllBookings((result) => {
        res.send(result);
    });
    mongoHelper.DeleteAllClients((result) => {
        res.send(result);
    });
});

//***** ***** ***** ***** ***** CUSTOMER PAGE   ***** ***** ***** ***** *****//
app.get('/home', checkSignIn, function(req,res, next){
    if (req.session.user.hotelid == null) {
        var err = new Error("You are not hotel account!");
        next(err);
        return;
    }
    let msg = "";
    if ( req.session.user.MessageService=='Trial') {
        const today = new Date();
        const expday = new Date( req.session.user.ExpirationDate_Message );
        const timeoffset = expday.getTime() - today.getTime() ;
        console.log( "Your message service trial left: "+Math.floor(timeoffset/1000/3600/24)+" Days!" );
        msg += "<div class='alert alert-warning'><i class='fa fa-warning'></i>&nbsp;"+"Your message service trial left: <b>"+Math.ceil(timeoffset/1000/3600/24)+"</b> Days!"+"</div>";
    }
    if ( req.session.user.SignService=='Trial') {
        const today = new Date();
        const expday = new Date( req.session.user.ExpirationDate_Sign );
        const timeoffset = expday.getTime() - today.getTime() ;
        console.log( "Your message service trial left: "+Math.floor(timeoffset/1000/3600/24)+" Days!" );
        msg += "<div class='alert alert-warning'><i class='fa fa-warning'></i>&nbsp;"+"Your signature service trial left: <b>"+Math.ceil(timeoffset/1000/3600/24)+"</b> Days!"+"</div>";
    }

    res.render('clients_dash',{message:msg});
});

app.get('/booking_stat',checkSignIn, function (req, res) {
    let data = {
        "totalbooking":0,
        "new":0,
        "repeated":0,
        "promoted":0
    }
    mongoHelper.GetBookingGroupByPhone(  async (results)=>{
        for(let i = 0; i < results.length ; i++) {
            data['totalbooking'] += results[i]['count'];
            if(results[i]['count'] == 1){
                data['new']+=results[i]['count'];
            }
            if(results[i]['count'] > 1){
                //data['repeated']++;
                let ispromo = false;
                try {
                    ispromo = await mongoHelper.isPromotion(results[i]['_id']);
                }catch (e) {
                }
                if( ispromo == true ){
                    data['promoted']+=results[i]['count'];
                }else
                    data['repeated']+=results[i]['count'];
            }
        }
        res.send(data);
    });

});
app.get('/messages_by_type',checkSignIn, function (req, res) {
    let data = {
        "welcome":[0,0],
        "cancel":[0,0],
        "promotion":[0,0],
        "reminder":[0,0],
        "confirm":[0,0]
    };
    mongoHelper.GetMessageByParams({"hotelid": req.session.user.hotelid }, (result)=>{
        let today = new Date();
        today.setHours(0);
        today.setMinutes(0);
        today.setSeconds(0);
        today.setMilliseconds(0);
        // console.log( today );
        for(let i = 0; i<result.length ; i++){
            if(result[i]["type"]==MessageType.WELCOME) {
                data['welcome'][1]++;
                if(result[i]['date']>today){
                    data['welcome'][0]++;
                }
            }
            if(result[i]["type"]==MessageType.CANCEL) {
                data['cancel'][1]++;
                if(result[i]['date']>today){
                    data['cancel'][0]++;
                }
            }
            if(result[i]["type"]==MessageType.PROMOTION) {
                data['promotion'][1]++;
                if(result[i]['date']>today){
                    data['promotion'][0]++;
                }
            }
            if(result[i]["type"]==MessageType.REMINDER) {
                data['reminder'][1]++;
                if(result[i]['date']>today){
                    data['reminder'][0]++;
                }
            }
            if(result[i]["type"]==MessageType.CONFIRM) {
                data['confirm'][1]++;
                if(result[i]['date']>today){
                    data['confirm'][0]++;
                }
            }
        }
        res.send(data);
    });
});

// ==============================
};
