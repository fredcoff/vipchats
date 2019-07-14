app.get('/login', function (req, res, next) {
    //console.log('ssl1')
    res.render('login');
});

app.post('/login', function (req, res, next) {
    //console.log('user/passwd',req.body.inputUsername, req.body.inputPassword);
    // you might like to do a database look-up or something more scalable here
    if (!req.body.inputUsername || !req.body.inputPassword){
        res.render('login',{message: "<div class='alert alert-danger'>Please enter both id and password!</div>"});
        return;
    }else{
        for(let i =0; i< adminUsers.length ; i++) {
            const adminuser = adminUsers[i];
            if(adminuser.username === req.body.inputUsername && adminuser.password === req.body.inputPassword){
                req.session.user = adminuser;
                req.session.user.is_admin = true;
                res.redirect('/admin_dash');
                return;
            }
        }
        // Find hotel users
        mongoHelper.GetHotelByParams({'Email': req.body.inputUsername, 'Password': md5(req.body.inputPassword) }, function(result){

            if ( result.length == 0 ) {
                res.render('login',{message: "<div class='alert alert-danger'>Invalid credentials!</div>"});
                return;
            } else {
                // hotel found!
                req.session.user = result[0];
                req.session.user['hotelid'] = result[0]['_id'];
                delete req.session.user['_id'];

                res.redirect('/home');
                // When redirect to home, checkSignIn will wait to check his MessageService and SignService expiration !
            }
        });


    }
});


// =============================================
app.get('/signup', function (req, res, next) {
    //console.log('ssl1')
    res.render('signup', {message:''});
});
app.get('/signup_renewal', function (req, res, next) {
    res.render('signup_renewal', {message:''});
});

app.post('/signup', function (req,res,next) {
    let hotel = new Hotel();
    hotel.HotelName = req.body.HotelName;
    hotel.FirstName = req.body.FirstName;
    hotel.LastName = req.body.LastName;
    hotel.Email = req.body.Email;
    hotel.Phone = req.body.Phone;
    hotel.NumberRooms = req.body.NumberRooms;
    hotel.Country = req.body.Country;
    hotel.Address = req.body.Address;
    hotel.Comments = req.body.Comments;

    let expday = new Date();
    expday.setDate( expday.getDate()+14 );

    var dd = expday.getUTCDate();
    var mm = expday.getUTCMonth()+1; //January is 0!
    var yyyy = expday.getUTCFullYear();

    if(dd<10) {
        dd = '0'+dd;
    }

    if(mm<10) {
        mm = '0'+mm;
    }

    hotel.created_at = new Date();
    hotel.ExpirationDate_Message = yyyy+"-"+mm+"-"+dd;
    hotel.ExpirationDate_Sign = yyyy+"-"+mm+"-"+dd;

    function makerandomstr() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 10; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    }

    const plain_password = makerandomstr();
    hotel.Password = md5( plain_password );

    mongoHelper.GetHotelByParams({$or:[{'HotelName': hotel.HotelName} , {'Email':hotel.Email}, {'Phone':hotel.Phone}]}, (result) => {
        let message = "";
        if ( result.length == 0) {
            mongoHelper.InsertHotel( hotel , (insres) => {
                if ( insres['ok'] == 1) {
                    message = "<div class='alert alert-danger'>Singup didn't stored in database!</div>";
                }

                // If success
                //  send confirm email via email
                const  mail_body = "<h1>Welcome to Vipchat</h1>"
                    +"<p>This is your credential to log in our awesome service\!</p>"
                    +"<table><tr><th><h4>Username</h4></th><td><h4>"+hotel.Email+"</h4></td></tr><tr><th><h4>Password</h4></th><td><h4>"+plain_password+"</h4></td></tr></table>";
                const mail_subject = "Sign Up Confirmation";
                const cmd_txt = 'echo "'+mail_body+'"|mail -s "$(echo "'+mail_subject+'\nContent-Type: text/html")" '+hotel.Email;
                exec(cmd_txt,
                    (error, stdout, stderr) => {
                        console.log(`stdout: ${stdout}`);
                        console.log(`stderr: ${stderr}`);
                        if (error !== null) {
                            console.log(`exec error: ${error}`);
                        }
                });

                //  rendering confirm page in web browser
                res.render('signup_confirm',{ 'message': message, 'email': hotel.Email, 'password': plain_password } );
            });
        } else {
            if (result[0]['HotelName'] == hotel.HotelName) {
                message =  hotel.HotelName+"<div class='alert alert-danger'>Already signed with this Hotel Name!  Try other!</div>";
            }else if (result[0]['Email'] == hotel.Email ){
                message =  hotel.Email+"<div class='alert alert-danger'>Already signed with your Email!   Try other!</div>";
            }else if (result[0]['Phone'] == hotel.Phone ){
                message =  hotel.Phone+"<div class='alert alert-danger'>Already signed with your Phone Number!   Try other!</div>";
            }

            res.render('signup_confirm',{ 'message': message } );
        }
    });
});

