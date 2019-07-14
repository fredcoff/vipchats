app.get('/setup_account', checkSignIn, function (req, res, next) {
    if (req.session.user.hotelid == null) {
        var err = new Error("You are not hotel account!");
        next(err);
        return;
    }
    res.render('setup_account', {message: '', Email: req.session.user.username});
});

app.get('/setup_sms', checkSignIn, function (req, res, next) {
    if (req.session.user.hotelid == null) {
        var err = new Error("You are not hotel account!");
        next(err);
        return;
    }
    mongoHelper.GetHotelByParams({"_id": new ObjectId(req.session.user.hotelid)} , function(result){
        if(result.length == 0) {
            res.render('goback', {message: "Cant' find your account! Did you logged in?"});
            return;
        }

        res.render('setup_sms', {
            message: '',
            hoteldata: result[0]
        });

    });
});

app.post('/setup_sms_save', checkSignIn, function(req,res,next){
    let params = {};
    params['setupWelcomeMsg'] = req.body.setupWelcomeMsg;
    params['setupCancelMsg'] = req.body.setupCancelMsg;
    params['setupReminderMsg'] = req.body.setupReminderMsg;
    params['setupPromotionMsg'] = req.body.setupPromotionMsg;

    params['PromotionDay1'] = req.body.PromotionDay1;
    params['PromotionDay2'] = req.body.PromotionDay2;
    mongoHelper.UpdateHotel( new ObjectId( req.session.user.hotelid ), params , function(result2) {
        if( result2['results']['result']['ok'] == 1 ) {
            for ( let key in params ) {
                req.session.user[key] = params[key];
            }
            res.render('goback.ejs', {
                'url' : '/setup_sms',
                'message': "SMS setting is changed successfully!"
            });
        }else {
            res.render('goback.ejs',{
                'url' : '/setup_sms',
                'message': "Not changed!"
            });
        }
    });
});

app.post('/setup_sms_save_text', checkSignIn, function(req,res,next){
    let params = {};
    if ( req.body.keyname == "welcome")
        params["textWelcomeMsg"] = req.body.msgtext;
    else if ( req.body.keyname == "cancel")
        params["textCancelMsg"] = req.body.msgtext;
    else if ( req.body.keyname == "reminder")
        params["textReminderMsg"] = req.body.msgtext;
    else if ( req.body.keyname == "promotion")
        params["textPromotionMsg"] = req.body.msgtext;
    else {
        res.send({
            'action' : 'error',
            'message': "Invalid keyname!"
        });
        return;
    }
    console.log(params);
    mongoHelper.UpdateHotel( new ObjectId( req.session.user.hotelid ), params , function(result2) {
        if( result2['results']['result']['ok']== 1 ) {
            for ( let key in params ) {
                req.session.user[key] = params[key];
            }
            res.send({
                'action' : 'success',
                'message': "Message is saved successfully!"
            });
            return;
        }else {
            res.send({
                'action' : 'error',
                'message': "Not changed!"
            });
            return;
        }
    });
});


app.get('/setup_sign', checkSignIn, checkSignatureService, function (req, res, next) {
    if (req.session.user.hotelid == null) {
        var err = new Error("You are not hotel account!");
        next(err);
        return;
    }
    mongoHelper.GetHotelByParams({"_id": new ObjectId(req.session.user.hotelid)} , function(result){
        if(result.length == 0) {
            res.render('goback', {message: "Cant' find your account! Did you logged in?"});
            return;
        }

        res.render('setup_sign', {
            message: '',
            protect_sign : result[0]['setupDataProtectionSign'],
            parking_sign : result[0]['setupParkingSign'],
            checkin_sign: result[0]['setupCheckInSign'],
            promotion_sign: result[0]['setupPromotionSign']
        });
    });
});

app.post('/setup_sign_save', checkSignIn, checkSignatureService, function (req, res, next) {
    let params = {};
    if ( req.body.keyname == "protect")
        params["setupDataProtectionSign"] = req.body.signature;
    else if ( req.body.keyname == "parking")
        params["setupParkingSign"] = req.body.signature;
    else if ( req.body.keyname == "checkin")
        params["setupCheckInSign"] = req.body.signature;
    else if ( req.body.keyname == "promotion")
        params["setupPromotionSign"] = req.body.signature;
    else {
        res.render('goback.ejs',{
            'message': "Invalid key name!"
        });
        return;
    }
    mongoHelper.UpdateHotel( new ObjectId( req.session.user.hotelid ), params , function(result2) {
        console.log(result2);
        if( result2['results']['result']['ok'] == 1 ) {
            // When success, update session information!
            for ( let key in params ) {
                req.session.user[key] = params[key];
            }
            res.render('goback.ejs', {
                'url' : '/setup_sign',
                'message': "Your signature is changed successfully!"
            });
        }else {
            res.render('goback.ejs',{
                'url' : '/setup_sign',
                'message': "Not changed!"
            });
        }
    });
});

app.post('/setup_account_email', checkSignIn, function(req,res, next) {
    let msg = "Your email address is changed successfully!";
    mongoHelper.GetHotelByParams({'_id': new ObjectId( req.session.user.hotelid ) }, function(result){

        if ( result.length == 0 ) {
            res.render('goback.ejs',{
                'message': "Can't find your account!"
            });
            return;
        } else {
            mongoHelper.GetHotelByParams({'Email': req.body.Email }, function(result1){
                    if ( result1.length > 0 ) {
                        res.render('goback.ejs',{
                            'message': "Your new email address is already in use! Please try other one!"
                        });
                        return;
                    }else{
                        mongoHelper.UpdateHotel( new ObjectId(result[0]['_id']), {'Email': req.body.Email }, function(result2) {
                            if( result2['results']['result']['ok'] == 1 ) {
                                req.session.user.username = req.body.Email;
                                res.render('goback.ejs',{
                                    'message': "Your email address is changed successfully!"
                                });
                            }else {
                                res.render('goback.ejs',{
                                    'message': "Not changed!"
                                });
                            }
                        } );
                    }
            });
        }
    });
});

app.post('/setup_account_pwd', checkSignIn, function(req,res, next) {
    let msg = "Your password is changed successfully!";
    mongoHelper.GetHotelByParams({'Email': req.session.user.username }, function(result){

        if ( result.length == 0 ) {
            res.render('goback.ejs',{
                'message': "Can't find your account!"
            });
            return;
        } else {
            mongoHelper.UpdateHotel( new ObjectId(result[0]['_id']), {'Password': req.body.newpwd }, function(result2) {
                if( result2['results']['modifiedCount'] == 1 ) {
                    req.session.user.password = req.body.newpwd;
                    res.render('goback.ejs', {
                        'message': "Your password is changed successfully!"
                    });
                }else {
                    res.render('goback.ejs',{
                        'message': "Not changed!"
                    });
                }
            });
        }
    });
});