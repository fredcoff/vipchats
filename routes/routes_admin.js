function checkAdmin(req, res, next){
    //console.log('checkSign',req.session.user);
    if(req.session.user && req.session.user['is_admin'] == true){
        next();     //If session exists, proceed to page
    } else {
        var err = new Error("You don't have permission to this page!");
        next(err);  //Error, trying to access unauthorized page!
    }
}

app.get('/admin_dash', checkAdmin, (req, res, next) => {
    res.render('admin_dash', {show_admin_menu:true});
});

app.get('/admin_hotels',checkAdmin, (req, res, next) => {
    NoCachePage(res);
    if ( req.query.HotelName == undefined){
        res.render('admin_hotels', {show_admin_menu:true, message:'',  reqname: ""});
        return;
    }
    mongoHelper.GetHotelByParams( { HotelName: {'$regex' : req.query.HotelName, '$options' : 'i'} },(hotels)=>{
        res.render('admin_hotels', {show_admin_menu:true, message:'', hotels:hotels, reqname:  req.query.HotelName});
    });
});

app.get('/admin_hotels_all',checkAdmin, (req, res, next) => {
    NoCachePage(res);
    res.render('admin_hotels_all', {show_admin_menu:true, message:''});
});

app.get('/admin_get_all_hotels', checkAdmin, (req,res,next)=>{
    mongoHelper.GetHotelByParams({},(results)=>{
        res.send(results);
    });
});



app.get('/admin_hotels_single/:_id', checkAdmin, function(req,res,next){
    NoCachePage(res);
    mongoHelper.GetHotelByParams( { '_id': new ObjectId(req.params._id) },(hotels)=>{
        res.render('admin_hotels_single',{show_admin_menu:true, hotel:hotels[0]});
    });
});

app.post('/admin_api_hotel_update/:_id',checkAdmin, function(req,res,next) {
    NoCachePage(res);
    let params = {
        "HotelName" : req.body.HotelName,
        "MessageService" : req.body.MessageService,
        "ExpirationDate_Message" : req.body.ExpirationDate_Message,
        "SignService" : req.body.SignService,
        "ExpirationDate_Sign" : req.body.ExpirationDate_Sign,

        "NumberRooms" : req.body.NumberRooms,
        "FirstName" : req.body.FirstName,
        "LastName" : req.body.LastName,
        "Email" : req.body.Email,
        "Phone" : req.body.Phone,
        "Address" : req.body.Address,
        "Country" : req.body.Country
    };
    mongoHelper.UpdateHotel( new ObjectId(req.params._id), params ,(result)=>{
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


app.post('/admin_api_hotel_delete/:_id',checkAdmin, function(req,res,next) {
    mongoHelper.DeleteHotelCompletely( new ObjectId(req.params._id),(result)=>{
        // console.log(result);
        let msg = 'Successfully deleted';
        if(result['deletedCount'] == 0) {
            msg = 'Not deleted!';
        }
        res.render('goback.ejs',{
            message: msg,
            step:2
        });
    });
});


app.get('/admin_api_hotelmsgstat', checkAdmin ,function(req,res, next){
   mongoHelper.GetHotelMessageServiceStat( (results)=>{
        res.send(results);
   });
});

app.get('/admin_api_hotelsignstat', checkAdmin ,function(req,res, next){
    mongoHelper.GetHotelSignServiceStat( (results)=>{
        res.send(results);
    });
});