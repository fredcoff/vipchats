function Hotel() {
    this.HotelName = '';
    this.FirstName = '';
    this.LastName = '';

    this.Email = '';
    this.Phone = '';
    this.NumberRooms = 0; // Number of your Rooms
    this.Country = 'Spain';
    this.Address = '';
    this.Comments = '';

    this.created_at = null;
    this.MessageService = 'Trial'; //Trial,Paid
    this.ExpirationDate_Message = 0; // Save as timestamp
    this.SignService = 'Trial'; //Trial,Paid
    this.ExpirationDate_Sign = 0; // Save as timestamp

    this.Password = null;

    this.setupDataProtectionSign = '';
    this.setupParkingSign = '';
    this.setupCheckInSign = '';
    this.setupPromotionSign = '';

    this.setupWelcomeMsg = false;
    this.setupCancelMsg = false;
    this.setupReminderMsg = false;
    this.setupPromotionMsg = false;
    this.PromotionDay1 = 1;
    this.PromotionDay2 = 350;

    this.textWelcomeMsg = 'This is welcome message!';
    this.textCancelMsg = 'This is cancellation message!';
    this.textReminderMsg = 'This is reminder message!';
    this.textPromotionMsg = 'This is promotion message!';

}

module.exports = Hotel;
