const mJs = require('moment');

const Person = require('../models/Person');
const Booking = require('../models/Booking');

function EmailParserHelper() {

    //***** ***** ***** ***** ***** BOOKING.COM ***** ***** ***** ***** *****//
    this.Booking_Email = function(emailText, status, callback) {
        console.log("[Email] Booking.com");
        Booking_GetPerson(emailText, (person) => {
            Booking_GetBooking(emailText, (booking) => {
                booking.Status = status;

                DisplayInformation(person, booking);
                callback(person, booking);
            });
        });
    };

    function Booking_GetPerson(emailText, callback) {
        let p = new Person();
            p.ReservationID = GetInformation(['Reservation ID'], emailText);
            p.Name = GetInformation(['Guest Name', 'Booked By'], emailText);
            p.Phone = GetInformation(['Guest Phone'], emailText);
            p.Email = GetInformation(['Guest Email'], emailText);
            p.City = GetInformation(['Guest Address'], emailText);
            p.Subscribed = true;
        callback(p);
    }

    function Booking_GetBooking(emailText, callback) {
        let b = new Booking();
            b.From = "Booking";
            b.BookedOn = mJs(GetInformation(['Booked On'], emailText), 'DD/MM/YYYY').toISOString();
            b.CheckIn = mJs(GetInformation(['Arrival Date'], emailText), 'YYYY-MM-DD').toISOString();
            b.CheckOut = mJs(GetInformation(['Departure Date'], emailText), 'YYYY-MM-DD').toISOString();
            b.sendPromotion = mJs(b.CheckIn).clone().add(1, 'year').toISOString();
        callback(b);
    }

    //***** ***** ***** ***** ***** EXPEDIA ***** ***** ***** ***** *****//
    this.Expedia_Email = function(emailText, status, callback) {
        console.log("[Email] Expedia");
        Expedia_GetPerson(emailText, (person) => {
            Expedia_GetBooking(emailText, (booking) => {
                booking.Status = status;

                DisplayInformation(person, booking);
                callback(person, booking);
            });
        });
    };

    function Expedia_GetPerson(emailText, callback) {
        let p = new Person();
            p.ReservationID = GetInformation(['Reservation ID'], emailText);
            p.Name = GetInformation(['Guest Name'], emailText);
            p.Phone = GetInformation(['Guest Phone'], emailText);
            p.Email = GetInformation(['Guest Email'], emailText);
            p.City = "";
            p.Subscribed = true;
        callback(p);
    }

    function Expedia_GetBooking(emailText, callback) {
        let b = new Booking();
            b.From = "Expedia";
            b.BookedOn = mJs(GetInformation(['Booked On'], emailText), 'DD/MM/YYYY').toISOString();
            b.CheckIn = mJs(GetInformation(['Check In'], emailText), 'DD/MM/YYYY').toISOString();
            b.CheckOut = mJs(GetInformation(['Check Out'], emailText), 'DD/MM/YYYY').toISOString();
            b.sendPromotion = mJs(b.CheckIn).clone().add(1, 'year').toISOString();
        callback(b);
    }

    //***** ***** ***** ***** ***** EUROPLAYAS ***** ***** ***** ***** *****//
    this.Europlayas_Email = function(emailText, status, callback) {
        console.log("[Email] Europlayas");
        Europlayas_GetPerson(emailText, (person) => {
            Europlayas_GetBooking(emailText, (booking) => {
                booking.Status = status;

                DisplayInformation(person, booking);
                callback(person, booking);
            });
        });
    };

    function Europlayas_GetPerson(emailText, callback) {
        let p = new Person();
            p.ReservationID = "";
            p.Name = GetInformation(['Customer'], emailText);
            p.Phone = GetInformation(['Phone'], emailText);
            p.Email = GetInformation(['Email'], emailText);
            p.City = GetInformation(['City'], emailText);
            p.Subscribed = true;
        callback(p);
    }

    function Europlayas_GetBooking(emailText, callback) {
        let b = new Booking();
            b.From = "Europlayas";
            b.BookedOn = mJs(GetInformation(['Booked On'], emailText), 'ddd DD MMM YYYY').toISOString();
            b.CheckIn = mJs(GetInformation(['Check In'], emailText), 'ddd DD MMM YYYY').toISOString();
            b.CheckOut = mJs(GetInformation(['Check Out'], emailText), 'ddd DD MMM YYYY').toISOString();
            b.sendPromotion = mJs(b.CheckIn).clone().add(1, 'year').toISOString();
        callback(b);
    }

    //***** ***** ***** ***** ***** THEBOOKINGBUTTON ***** ***** ***** ***** *****//
    this.TheBookingButton_Email = function(emailText, status, callback) {
        console.log("[Email] TheBookingButton");
        TheBookingButton_GetPerson(emailText, (person) => {
            TheBookingButton_GetBooking(emailText, (booking) => {
                booking.Status = status;

                DisplayInformation(person, booking);
                callback(person, booking);
            });
        });
    };

    function TheBookingButton_GetPerson(emailText, callback) {
        let p = new Person();
            p.ReservationID = GetInformation(['Número de referencia'], emailText);
            p.Name = GetInformation(['Nombre del huésped'], emailText);
            p.Phone = GetInformation(['Teléfono del huésped'], emailText);
            p.Email = GetInformation(['Correo electrónico del huésped'], emailText);
            p.City = GetInformation(['City'], emailText);
            p.Subscribed = true;
        callback(p);
    }

    function TheBookingButton_GetBooking(emailText, callback) {
        let b = new Booking();
            b.From = "Hotel Site";
            b.BookedOn = mJs(GetInformation(['Fecha de reserva'], emailText), 'DD MMM YYYY').toISOString();
            b.CheckIn = mJs(GetInformation(['Fecha de llegada'], emailText), 'DD MMM YYYY').toISOString();
            b.CheckOut = mJs(GetInformation(['Fecha de salida'], emailText), 'DD MMM YYYY').toISOString();
            b.sendPromotion = mJs(b.CheckIn).clone().add(1, 'year').toISOString();
        callback(b);
    }

    //***** ***** ***** ***** *****  *  ***** ***** ***** ***** *****//

    /** * @return {String} */
    function GetInformation(startWord, emailText) {
        let start = emailText.indexOf(startWord[0]);

        if(start <= -1) {
            if(startWord[1]) { start = emailText.indexOf(startWord[1]); }
            if(start <= -1) return '';
        }

        let end = emailText.indexOf('\n', start);
        let substring = emailText.substring(start, end);
        let toReturn;

        if(substring.indexOf('Further') > -1) substring = substring.split('Further')[0];
        if(substring.indexOf('<') > -1) substring = substring.split('<')[0];

        if(startWord[0] === 'Guest Email') {
            toReturn = substring.split(':')[1].split(' ')[1].trim();
        } else {
            toReturn = substring.split(':')[1].trim();
        }

        if(toReturn) return toReturn;
        else return "";
    }

    function DisplayInformation(person, booking) {
        console.log("Person:\n" + JSON.stringify(person, null, 3));
        console.log("Booking:\n" + JSON.stringify(booking, null, 3))
    }
}

module.exports = EmailParserHelper;
