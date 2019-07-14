function Person() {
    this.ReservationID = '';
    this.hotelid = null;

    this.Firstname = '';
    this.Lastname = '';
    this.Phone = '';
    this.Email = '';
    this.City = '';

    this.Subscribed = false;

    /** personal signature info**/
    this.is_protect = false;
    this.is_promo = false;
    this.is_parking = false;
    this.is_checkin = false;
    this.DataProtectionSignature = '';
    this.PromoSignature = '';
    this.ParkingSignature = '';
    this.CheckinSignature = '';
}

module.exports = Person;
