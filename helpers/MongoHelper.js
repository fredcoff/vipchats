var dateFormat = require('dateformat');



const MongoClient = require('mongodb').MongoClient,
        assert = require('assert');

function MongoHelper(moment) {
    // let url = 'mongodb://hotelsanchouser:25SSvC9l@127.0.0.1:27017/hotelsancho';
    let url = 'mongodb://127.0.0.1:27017/vipchats';




    function Connect(callback) {
        MongoClient.connect(url, function(err, db) {
            assert.equal(null, err);
            //console.log('Connected to the Database Server!');
            callback(db);
        });
    }

    //***** ***** ***** ***** *****   INSERT   ***** ***** ***** ***** *****//
    this.InsertPerson = function(person, callback) {
        ListClientByPhone(person.Phone, (result) => {
            if(result.length === 0) {
                Connect((db) => {
                    let clientTable = db.collection('client');
                    clientTable.insertOne({
                        "firstname": person.Firstname, "lastname" : person.Lastname , "phone": person.Phone, "email": person.Email, "city": person.City, "subscribed": person.Subscribed,
                        "is_protect":person.is_protect,
                        "is_promo":person.is_promo,
                        "is_parking":person.is_parking,
                        "hotelid" : person.hotelid ,
                        "DataProtectionSignature" : person.DataProtectionSignature,
                        "PromoSignature" : person.PromoSignature,
                        "ParkingSignature" : person.ParkingSignature,
                        "CheckinSignature" : person.CheckinSignature
                    }, function(err, result) {
                        assert.equal(err, null);
                        console.log("Client Inserted with Success!");
                        callback(result);

                        db.close();
                    });
                });
            } else {
                console.log("Client Already in Database.");
                callback(result);
            }
        });
    };
    this.updatePerson = function (_id, params, callback){
        Connect((db) => {
            let clientTable = db.collection('client');
            clientTable.updateOne({_id:_id },
                {$set: params }, function (err, results) {
                assert.equal(err, null);
                let res = {results};
                callback(res);
                db.close();
            });
        });
    }

    this.deletePerson = function (_id, callback){
        Connect((db) => {
            let clientTable = db.collection('client');
            clientTable.deleteOne({_id:_id}, function (err, results) {
                    assert.equal(err, null);
                    let res = {results};
                    callback(res);
                    db.close();
                });
        });
    }
    this.InsertBooking = function(phone, booking, callback) {
        Connect((db) => {
            let bookingTable = db.collection('booking');

            bookingTable.find({ bookingid: booking.BookingId }).toArray(function(err, result) {
                assert.equal(err, null);
 
                if(result.length === 0) {

                    bookedon=dateFormat(booking.BookedOn, "dd-mm-yyyy");                        
                    checkin=dateFormat(booking.CheckIn, "dd-mm-yyyy");                        
                    checkout=dateFormat(booking.CheckOut, "dd-mm-yyyy");                        
                    sendpromotion=dateFormat(booking.sendPromotion, "dd-mm-yyyy");                        

                    bookingTable.insertOne({
                        "phone": phone, "from": booking.From,
                        "bookingid":booking.BookingId,
                        "bookedOn": bookedon, "checkIn": checkin, "checkOut": checkout,
                        "status": booking.Status, "sendPromotion": sendpromotion
                    }, function(err, result) {
                        assert.equal(err, null);
                        console.log("New Booking Inserted with Success!", booking.BookingId );

                        let res = { sendSms: true, result };
                        callback(res);

                        db.close();
                    });

                } else {
                        console.log("Booking Already in Database.");
                        let res = { sendSms: false, result };
                        callback(res);
                        db.close();
                }
            });
        });
    };

    this.ActivateSubscription = function(phone, callback) {
        Connect((db) => {
                let clientTable = db.collection('client');

                console.log("Mongodb Activate subscription for phone: ", phone);
                clientTable.find({ phone: phone }).toArray(function(err, result) {
                    assert.equal(err, null);
                    //console.log("Mongodb activate phone find: ",result.length);
                    //if (result.length==0){
                      //req.flash('subsmsg', 'Phone not found!')
                    //  callback('Phone not found!'); 
                    //}else{
                   //   callback('Successfully subscribed!'); 
                      //req.flash('subsmsg', 'Successfully subscribed')
                   // } 
                    //console.log(err);
                    //callback(err); 

                });

             //if (result.length>0){
                clientTable.updateOne({phone: phone},
                { $set: { subscribed: true }}, function(err, results) {
                assert.equal(err, null);
                let res = { results };
                //res.sendSms = results.result.nModified === 1;
                //console.log('subscription updating phone',res)
                callback(res);
            });

            //}
            db.close();
        });
    };

    this.CancelSubscription = function(phone, callback) {
        Connect((db) => {
                let clientTable = db.collection('client');
                console.log("Mongodb Cancel subscription for phone: ", phone);
                clientTable.updateOne({phone: phone},
                { $set: { subscribed: false }}, function(err, results) {
                assert.equal(err, null);
                let res = { results };
                res.sendSms = results.result.nModified === 1;
                callback(res);
                db.close();
            });
        });
    };

    this.CancelBooking = function(phone, booking, callback) {
        Connect((db) => {
            let bookingTable = db.collection('booking');

                console.log("Booking changed to canceled")
                bookingTable.updateOne({bookingid: booking.BookingId},
                { $set: { status: "Canceled" }}, function(err, results) {
                assert.equal(err, null);

                let res = { results };
                res.sendSms = results.result.nModified === 1;

                callback(res);
                db.close();
            });
        });
    };

    // ================================================
    this.InsertHotel = function ( hotel , callback ) {
        Connect((db) => {
            let hotelTable = db.collection('hotels');
            hotelTable.insertOne( hotel , function(err, result) {
                assert.equal(err, null);
                console.log("Message Inserted into database with Success!");
                callback(result);
                db.close();
            });

        });
    };

    //***** ***** ***** ***** *****   SHOW   ***** ***** ***** ***** *****//
    this.ListAllClients = function(callback) {
        Connect((db) => {
            let clientTable = db.collection('client');

            clientTable.find({}).toArray(function(err, result) {
                assert.equal(err, null);
                callback(result);

                db.close();
            });
        });
    };

    function ListClientByPhone(phone, callback) {
        Connect((db) => {
            let clientTable = db.collection('client');

            clientTable.find({ phone: phone }).toArray(function(err, result) {
                assert.equal(err, null);
                callback(result);

                db.close();
            });
        });
    }

    this.ListClientByLastName = function (lastname, callback) {
        Connect((db) => {
            let clientTable = db.collection('client');

            clientTable.find({lastname: new RegExp(lastname+'$','i')}).toArray(function(err, result) {
                assert.equal(err, null);
                callback(result);
                db.close();
            });
        });
    };

    this.ListClientByParams = function (params, callback) {
        Connect((db) => {
            let clientTable = db.collection('client');

            clientTable.find( params ).toArray(function(err, result) {
                assert.equal(err, null);
                callback(result);
                db.close();
            });
        });
    };

    this.GetClientByParams = function (params, callback) {
        Connect((db) => {
            let clientTable = db.collection('client');
            console.log(params);
            clientTable.findOne( params ,function(err, result) {
                assert.equal(err, null);
                callback(result);
                db.close();
            });
        });
    };

    this.GetLastBooking = async function (phone){
        let db = await MongoClient.connect(url);
        let bookingTable = db.collection('booking');
        try {
            let res = await bookingTable.find({phone:phone}).sort({bookedOn:-1}).limit(1).toArray();
            return res[0];
        }catch(err){
            console.log(err);
            return null;
        }finally {
            db.close();
        }
    }

    this.GetLastCheckIn = async function (phone){
        let db = await MongoClient.connect(url);
        let bookingTable = db.collection('booking');
        try {
            let res = await bookingTable.find({phone:phone}).sort({checkIn:-1}).limit(1).toArray();
            return res[0];
        }catch(err){
            console.log(err);
            return null;
        }finally {
            db.close();
        }
    }

    this.isPromotionPhone = async function (phone){
        if(phone == null || phone=='')
            return false;
        let db = await MongoClient.connect(url);
        let clientTable = db.collection('client');
        try {
            let res = await clientTable.findOne({phone:phone});
            if (res==undefined)
                return false;
            if (res['is_promo']==true)
                return true;
            return false;
        }catch(err){
            console.log(err);
            return false;
        }finally {
            db.close();
        }
    }

    this.isPromotion = async function (_id){
        if(_id == null || _id=='')
            return false;
        let db = await MongoClient.connect(url);
        let clientTable = db.collection('client');
        try {
            let res = await clientTable.findOne({_id: _id });
            if (res==undefined)
                return false;
            if (res['is_promo']==true)
                return true;
            return false;
        }catch(err){
            console.log(err);
            return false;
        }finally {
            db.close();
        }
    }

    this.ListAllBookings = function(callback) {
        Connect((db) => {
            let bookingTable = db.collection('booking');

            bookingTable.find({}).toArray(function(err, result) {
                assert.equal(err, null);
                callback(result);
                db.close();
            });
        });
    };

    this.ListClientBookings = function(thePhone, callback) {
        Connect((db) => {
            let bookingTable = db.collection('booking');

            bookingTable.find({phone: thePhone}).toArray(function(err, result) {
                assert.equal(err, null);
                callback(result);
                db.close();
            });
        });
    };

    this.ListPromotionBookings = function(date, callback) {
        Connect((db) => {
            let clientTable = db.collection('client');

            clientTable.aggregate([
                { $lookup: {
                    from: 'booking',
                    localField: 'phone',
                    foreignField: 'phone',
                    as: 'Bookings'
                }},
                { $unwind: "$Bookings" },
                { $match: { subscribed: true,
                            "Bookings.status": "Booked",
                            "Bookings.sendPromotion": date,
                            "Bookings.from": { $ne: 'Hotel Site' } }}
            ], function(err, result) {
                assert.equal(err, null);

                callback(result);
                db.close();
            });
        });
    };

    //***** ***** ***** ***** *****   UPDATE   ***** ***** ***** ***** *****//
    this.UpdateSubscription = function(phone, sub, callback) {
        Connect((db) => {
            let clientTable = db.collection('client');

            clientTable.updateOne({phone: phone}, { $set: { subscribed: sub }}, function(err, result) {
                assert.equal(err, null);

                callback(result);
                db.close();
            });
        });
    };

    this.UpdateSendPromotion = function(result, nextYear, callback) {
        Connect((db) => {
            let bookingTable = db.collection('booking');

            console.log(result);
            bookingTable.updateOne({ _id: result.Bookings._id }, { $set: { sendPromotion: nextYear }}, function(err, done) {
                assert.equal(err, null);

                callback(done);
                db.close();
            });
        });
    };

    //***** ***** ***** ***** *****   COUNT   ***** ***** ***** ***** *****//

    this.CountBookedFrom = function(callback) {
        Connect((db) => {
            let bookingTable = db.collection('booking');
            let data = [];

            bookingTable.find({ from: 'Booking' }).count((e, count1) => {
                data.push(count1);
                bookingTable.find({ from: 'Expedia' }).count((e, count2) => {
                    data.push(count2);
                    bookingTable.find({ from: 'Europlayas' }).count((e, count3) => {
                        data.push(count3);
                        bookingTable.find({ from: 'Hotel Site' }).count((e, count4) => {
                            data.push(count4);
                            callback(data);

                            db.close();
                        });
                    });
                });
            });
        });
    };

    this.CountPromos = function(year, callback) {
        Connect((db) => {
            let bookingTable = db.collection('booking');
            let data = [];

            bookingTable.find({ from: { $ne: 'Hotel Site' }, checkIn: { $regex: '' + year + '' } }).count((e, count1) => {
                data.push(count1);
                bookingTable.find({ from: 'Hotel Site', checkIn: { $regex: '' + year + '' } }).count((e, count2) => {
                    data.push(count2);
                    callback(data);

                    db.close();
                });
            });
        });
    };

    this.MonthlyPromos = function(beginDate, endDate, callback) {
        Connect((db) => {
            let clientTable = db.collection('client');
            clientTable.aggregate([
                { $lookup: {
                    from: 'booking',
                    localField: 'phone',
                    foreignField: 'phone',
                    as: 'Bookings'
                }},
                { $unwind: "$Bookings" },
                { $match: { subscribed: true,
                    "Bookings.status": "Booked",
                    "Bookings.from": { $ne: 'Hotel Site' },
                    "Bookings.checkIn": { $gte: beginDate, $lte: endDate }}}
            ], function(err, result) {
                assert.equal(err, null);

                result.forEach((res) => {
                    res.Bookings.bookedOn = moment(res.Bookings.bookedOn).format('DD-MM-YYYY');
                    res.Bookings.checkIn = moment(res.Bookings.checkIn).format('DD-MM-YYYY');
                    res.Bookings.checkOut = moment(res.Bookings.checkOut).format('DD-MM-YYYY');
                });

                callback(result);
                db.close();
            });
        });
    };

    this.CountSubscriptions = function(callback) {
        Connect((db) => {
            let clientTable = db.collection('client');
            let data = [];

            clientTable.find({ subscribed: true }).count((e, count1) => {
                data.push(count1);
                clientTable.find({ subscribed: false }).count((e, count2) => {
                    data.push(count2);
                    callback(data);
                    db.close();
                });
            });
        });
    };

    //***** ***** ***** ***** *****   DELETE   ***** ***** ***** ***** *****//

    this.DeleteAllClients = function(callback) {
        Connect((db) => {
            let clientTable = db.collection('client');

            clientTable.deleteMany({}, function(err, result) {
                assert.equal(err, null);
                console.log("Client Collection Deleted!");
                callback(result);

                db.close();
            });
        });
    };

    this.DeleteAllBookings = function(callback) {
        Connect((db) => {
            let bookingTable = db.collection('booking');

            bookingTable.deleteMany({}, function(err, result) {
                assert.equal(err, null);
                console.log("Booking Collection Deleted!");
                callback(result);

                db.close();
            });
        });
    };

    /**
     *  Message collection
     */
    this.InsertMessage = function(message, callback) {
        Connect((db) => {
            let messageTable = db.collection('message');
            messageTable.insertOne({
                "phone": message.phone,
                "text":message.text,
                "type":message.type,
                "date":message.date,
                "hotelid":message.hotelid,
            }, function(err, result) {
                assert.equal(err, null);
                if ( message.hotelid == null || message.hotelid == "" ) {
                    console.log("Message Inserted into database with Success!");
                    callback(result);
                    db.close();
                    return;
                }
                messageTable.count( {"hotelid": message.hotelid } ,function(err1, msgcount){
                    assert.equal(err1, null);
                    console.log("Hotel Message Count :"+msgcount);
                    const MAX_MESSAGE = 1000;
                    if ( msgcount <= MAX_MESSAGE) {
                        console.log("Message Inserted into database with Success!");
                        callback(result);
                        db.close();
                        return;
                    }

                    messageTable.find({"hotelid": message.hotelid }).limit( msgcount - MAX_MESSAGE).toArray( function(err2, msglist) {
                        assert.equal(err2, null);
                        let removeIdsArray = [];
                        for( let i = 0 ; i< msglist.length; i++) {
                            removeIdsArray.push( msglist[i]['_id'] );
                        }
                        messageTable.deleteMany({_id: {$in: removeIdsArray}}, function(err3, resdelete) {
                            assert.equal(err3, null);
                            console.log("Message Inserted into database with Success!");
                            callback(result);
                            db.close();
                            return;
                        });
                    });

                });
            });

        });
    };

    this.GetMessageByNumber = function (phone, callback){
        Connect((db) => {
            let messageTable = db.collection('message');
            messageTable.find({ phone: phone }).toArray(function(err, result) {
                assert.equal(err, null);
                callback(result);

                db.close();
            });
        });
    }

    this.GetMessageByParams = function (params, callback){
        Connect((db) => {
            let messageTable = db.collection('message');
            messageTable.find(params).toArray(function(err, result) {
                assert.equal(err, null);
                callback(result);

                db.close();
            });
        });
    }
    this.GetBookingGroupByPhone = function ( callback){
        Connect((db) => {
            let bookingTable = db.collection('booking');
            bookingTable.aggregate([
                {"$group" : {_id:"$phone", count:{$sum:1}}}
            ]).toArray(function(err, result) {
                assert.equal(err, null);
                callback(result);

                db.close();
            });
        });
    }

    /*=======Hotel Table======*/
    this.GetHotelByParams =  function (params, callback){
        Connect((db) => {
            let hotelTable = db.collection('hotels');
            hotelTable.find(params).toArray(function(err, result) {
                assert.equal(err, null);
                callback(result);

                db.close();
            });
        });
    }

    this.InsertHotel = function ( hotel , callback ) {
        Connect((db) => {
            let hotelTable = db.collection('hotels');
            hotelTable.insertOne( hotel , function(err, result) {
                assert.equal(err, null);
                console.log("Message Inserted into database with Success!");
                callback(result);
                db.close();
            });

        });
    };

    this.UpdateHotel = function (_id, params, callback){
        Connect((db) => {
            let hotelTable = db.collection('hotels');
            hotelTable.updateOne({_id:_id },
                {$set: params }, function (err, results) {
                    assert.equal(err, null);
                    let res = {results};
                    callback(res);
                    db.close();
                });
        });
    };

    this.getMysqlFormatDate = function ( date ){
        const datestr = date.getUTCFullYear() + '-' +
            ('00' + (date.getUTCMonth()+1)).slice(-2) + '-' +
            ('00' + date.getUTCDate()).slice(-2) + ' ' +
            ('00' + date.getUTCHours()).slice(-2) + ':' +
            ('00' + date.getUTCMinutes()).slice(-2) + ':' +
            ('00' + date.getUTCSeconds()).slice(-2);
        return datestr;
    }

    this.GetHotelMessageServiceStat = function( callback ){
        Connect((db) => {
            let hotelTable = db.collection('hotels');
            const now = this.getMysqlFormatDate(new Date());
            hotelTable.aggregate(
                [
                    {
                        "$match":{
                            "ExpirationDate_Message": {"$gt":now }
                        }
                    },
                    {
                        "$group" : {
                            "_id" : "$MessageService",
                            "count": { "$sum":1 }
                        }
                    }
                ], function( err, results) {
                    hotelTable.count( {"ExpirationDate_Message": {"$lte": now  }} ,function(err, res){
                        results.push({_id:"Expired", count: res});
                        callback(results);
                        db.close();
                    });
                }
            );
        });
    }

    this.GetHotelSignServiceStat = function( callback ){
        Connect((db) => {
            let hotelTable = db.collection('hotels');
            const now = this.getMysqlFormatDate(new Date());
            hotelTable.aggregate(
                [
                    {
                        "$match":{
                            "ExpirationDate_Sign": {"$gt":now }
                        }
                    },
                    {
                        "$group" : {
                            "_id" : "$SignService",
                            "count": { "$sum":1 }
                        }
                    }
                ], function( err, results) {
                    hotelTable.count( {"ExpirationDate_Sign": {"$lte": now  }} ,function(err, res){
                        results.push({_id:"Expired", count: res});
                        callback(results);
                        db.close();
                    });
                }
            );
        });
    }

    this.DeleteHotelCompletely = function (_id, callback){
        Connect((db) => {
            let hotelTable = db.collection('hotels');
            hotelTable.deleteOne({_id:_id}, function (err, result) {
                assert.equal(err, null);
                let clientTable = db.collection('client');
                clientTable.deleteMany( { "hotelid" : _id.toString()}, function(err1, result1) {
                    assert.equal(err1, null);
                    let messageTable = db.collection('message');
                    messageTable.deleteMany( {"hotelid": _id.toString()}, function(err2, result2) {
                       assert.equal( err2, null);
                       console.log( result );
                       callback(result);
                    });
                });
            });
        });
    }
}

module.exports = MongoHelper;
