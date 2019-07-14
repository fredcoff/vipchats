app.get('/get/clients/all', function(req, res) {
    /*
    mongoHelper.ListAllClients((result) => {
        res.send(result);
    });
    */

    mongoHelper.ListClientByParams({ hotelid: req.session.user.hotelid }, (result)=>{
        res.send(result);
    });
});

app.get('/clients', checkSignIn,  function(req,res,next){
    if (req.session.user.hotelid == null) {
        var err = new Error("You are not hotel account!");
        next(err);
        return;
    }

    let params = {};
    if( isset( req.query['lastname'] ))
        params['lastname'] = {'$regex' : req.query['lastname'], '$options' : 'i'};
    if( isset( req.query['phone'] ))
        params['phone'] = {'$regex' : "\\"+req.query['phone'], '$options' : 'i'};

    console.log(params);
    if ( issetmap( params ) ) {

        params['hotelid'] =  req.session.user.hotelid;

        mongoHelper.ListClientByParams(params, async(clients) => {
            for(let i=0; i< clients.length; i++) {
                let lastbook = await mongoHelper.GetLastBooking(clients[i]['phone']);
                if(lastbook!=null) clients[i]['lastbooking'] = lastbook['bookedOn'];

            }
            NoCachePage(res);
            res.render('clients',{ message:'', s_clients: clients, reqdata:req.query });
        })
    }else{
        res.render('clients',{message:'',reqdata:[]});
    }
});

app.get('/clients_new', checkSignIn, function(req,res){
    if (req.session.user.hotelid == null) {
        var err = new Error("You are not hotel account!");
        next(err);
        return;
    }
    res.render('clients_new',{message:''});
});




app.get('/clients_single/:_id', checkSignIn, function(req,res,next){
    mongoHelper.GetClientByParams({_id:new ObjectId(req.params._id)}, async (client) => {
        let msg = '';
        if( isset(req.query.msg) ){
            let msg_type = isset(req.query.msg_type)?req.query.msg_type:"alert-info";
            msg = '<div class="alert alert-'+msg_type+'">'+req.query.msg+'</div>';
        }

        if ( client == null ){
            var err = new Error("Can't find client with given id!");
            next(err);
            return;
        }
        if (req.session.user.hotelid == null) {
            var err = new Error("You are not hotel account!");
            next(err);
            return;
        }
        if ( client['hotelid'] != req.session.user.hotelid){
            var err = new Error("This client is not yours!");
            next(err);
            return;
        }

        let lastcheckIn;
        try{
            lastcheckIn = await mongoHelper.GetLastCheckIn(client['phone']);
        }catch(err){
        }
        NoCachePage(res);
        res.render('clients_single',{message:msg, client:client, lastcheckIn: lastcheckIn});
    })
});

app.get('/clients_sign/:keyname/:_id', checkSignIn, checkSignatureService, function(req,res, next){
    mongoHelper.GetClientByParams({_id:new ObjectId(req.params._id)}, async (client) => {

        if ( client == null ){
            var err = new Error("Can't find client with given _id!");
            next(err);
            return;
        }
        console.log( client );
        if (req.session.user.hotelid == null) {
            var err = new Error("You are not hotel account!");
            next(err);
            return;
        }
        if ( client['hotelid'] != req.session.user.hotelid){
            var err = new Error("This client is not yours!");
            next(err);
            return;
        }

        let title = '', signtext = '', is_signed = false;
        if ( req.params.keyname == 'protect') {
            title = "Data Protection Signature";
            is_signed = client['is_protect'];
            if (is_signed)
                signtext = client['DataProtectionSignature'];
            else
                signtext = req.session.user['setupDataProtectionSign'];
        } else if ( req.params.keyname == 'promotion') {
            title = "Data Promotion Signature";
            is_signed = client['is_promo'];
            if(is_signed)
                signtext = client['PromoSignature'];
            else
                signtext = req.session.user['setupPromotionSign'];
        } else if ( req.params.keyname == 'parking') {
            title = "Data Parking Signature";
            is_signed = client['is_parking'];
            if(is_signed)
                signtext = client['ParkingSignature'];
            else
                signtext = req.session.user['setupParkingSign'];
        } else if ( req.params.keyname == 'checkin') {
            title = "Data Checkin Signature";
            is_signed = client['is_checkin'];
            if(is_signed)
                signtext = client['CheckinSignature'];
            else
                signtext = req.session.user['setupCheckInSign'];
        } else {
            var err = new Error("Unknown keyname!");
            next(err);
            return;
        }

        NoCachePage(res);
        res.render('clients_sign',{  message:'', title: title, keyname: req.params.keyname , client:client, is_signed:is_signed, signtext: signtext });
    });
});



app.post('/clients_api_sign/:_id', checkSignIn, checkSignatureService, function(req,res, next){

    let params = {
    };
    if(req.body.keyname == "protect") {
        params['is_protect'] = true;
        params['DataProtectionSignature'] = req.body.signtext;
    }
    else if(req.body.keyname == "promotion") {
        params['is_promo'] = true;
        params['PromoSignature'] = req.body.signtext;
    }
    else if(req.body.keyname == "parking") {
        params['is_parking'] = true;
        params['ParkingSignature'] = req.body.signtext;
    }
    else if(req.body.keyname == "checkin") {
        params['is_checkin'] = true;
        params['CheckinSignature'] = req.body.signtext;
    }else{
        var err = new Error("Invalid keyname!");
        next(err);
        return;
    }
    // console.log(req.body);
    mongoHelper.updatePerson(new ObjectId( req.params._id ), params, (result)=>{
        // console.log(result);
        let msg = 'Successfully updated';
        if(result["modifiedCount"]==0) {
            msg = 'Not updated';
        }

        res.render('goback.ejs', {
            message: msg,
            reloadopener: true
        });
    });
});

app.post('/clients_api_sign_clear/:_id', checkSignIn, checkSignatureService,  function(req,res, next){

    let params = {
    };
    if(req.body.keyname == "protect") {
        params['is_protect'] = false;
        params['DataProtectionSignature'] = '';
    }
    else if(req.body.keyname == "promotion") {
        params['is_promo'] = false;
        params['PromoSignature'] =  '';
    }
    else if(req.body.keyname == "parking") {
        params['is_parking'] = false;
        params['ParkingSignature'] = '';
    }
    else if(req.body.keyname == "checkin") {
        params['is_checkin'] = false;
        params['CheckinSignature'] =  '';
    }else{
        var err = new Error("Invalid keyname!");
        next(err);
        return;
    }
    // console.log(req.body);
    mongoHelper.updatePerson(new ObjectId( req.params._id ), params, (result)=>{
        // console.log(result);
        let msg = 'Signature deleted!';
        if(result["modifiedCount"]==0) {
            msg = 'Not deleted';
        }
        res.render('goback.ejs',{
            message: msg,
            reloadopener: true
        });
    });
});


app.post('/clients_api_new', checkSignIn, function(req,res){
    let p = new Person();
    p.Firstname = req.body.firstname;
    p.Lastname = req.body.lastname;
    p.City = req.body.City;
    p.Phone = req.body.Phone;


    p.hotelid = req.session.user.hotelid;
    if ( req.body.is_protect=='on' ) {
        p.is_protect = true;
        p.DataProtectionSignature = req.session.user.setupDataProtectionSign;
    }
    if ( req.body.is_promo=='on' ) {
        p.is_promo = true;
        p.PromoSignature = req.session.user.setupPromotionSign;
    }
    if ( req.body.is_parking=='on' ) {
        p.is_parking = true;
        p.ParkingSignature = req.session.user.setupParkingSign;
    }
    if ( req.body.is_checkin=='on' ) {
        p.is_checkin = true;
        p.CheckinSignature = req.session.user.setupCheckInSign;
    }

    mongoHelper.InsertPerson(p, (result)=>{
        let msg = 'Failed Add';
        let returl = null;
        if(result['insertedCount']>0){
            console.log(result['insertedCount']);
            let insertedId = result['insertedId'];
            //console.log(result['ops']);
            msg = 'Add client success';
            returl = '/clients_single/'+insertedId; // If success , redirects to edit page!
        }else if(result[0]['_id']!=null){
            msg = 'Client with same phone number already exist!';
        }
        res.render('goback.ejs',{
            message: msg,
            url: returl
        });
    });
});


app.post('/clients_api_update/:_id', checkSignIn, function(req,res){
    let params = {
        firstname : req.body.firstname,
        lastname : req.body.lastname,
        city : req.body.city,
        phone : req.body.phone,
    };
    mongoHelper.updatePerson(new ObjectId( req.params._id ), params, (result)=>{
        // console.log(result);
        let msg = 'Successfully updated';
        if(result["modifiedCount"]==0) {
            msg = 'Not updated';
        }
        res.render('goback.ejs',{
            message: msg
        });
    });
});

app.post('/clients_api_delete', checkSignIn, function(req,res){
    let params = {};
    // console.log(req.body);
    mongoHelper.deletePerson(new ObjectId( req.body._id ) , (result)=>{
        // console.log(result);
        let msg = 'Successfully deleted';
        if(result['results']['deletedCount'] == 0){
            msg = "Not deleted";
        }
        res.render('goback.ejs',{
            message: msg,
            step: 2
        });
    });
});

app.get('/clients_by_service',checkSignIn, function (req, res) {
    let data = {
        "datasets":[{"data":[],
            "backgroundColor":[]
        }],
        "labels":[]
    };
    mongoHelper.ListClientByParams({ hotelid: req.session.user.hotelid }, (result)=>{
        let p1 = 0, p2 = 0, p3 = 0 , p4 = 0;
        for(let i = 0; i<result.length ; i++){
            if(result[i]["is_promo"]) p1++;
            if(result[i]["is_protect"]) p2++;
            if(result[i]["is_parking"]) p3++;
            if(result[i]["is_checkin"]) p4++;
        }
        data["datasets"][0]["data"].push( result.length>0?Number((p1/result.length)*100).toFixed(2):0 );
        data["datasets"][0]["backgroundColor"].push( "#36a2eb" );
        data["labels"].push( "Promotions" );
        data["datasets"][0]["data"].push( result.length>0?Number((p2/result.length)*100).toFixed(2):0 );
        data["datasets"][0]["backgroundColor"].push( "#36eb4e" );
        data["labels"].push( "Data Protection" );
        data["datasets"][0]["data"].push( result.length>0?Number((p3/result.length)*100).toFixed(2):0 );
        data["datasets"][0]["backgroundColor"].push( "#ffc107" );
        data["labels"].push( "Parking" );
        data["datasets"][0]["data"].push( result.length>0?Number((p4/result.length)*100).toFixed(2):0 );
        data["datasets"][0]["backgroundColor"].push( "#ffc107" );
        data["labels"].push( "Checkin" );
        res.send({
            total: result.length,
            graph: data
        });
    });
});

app.get('/dashboard',checkSignIn, function (req, res, next) {
    if (req.session.user.hotelid == null) {
        var err = new Error("You are not hotel account!");
        next(err);
        return;
    }
    res.render('dashboard',{id: req.session.user.id});
});



