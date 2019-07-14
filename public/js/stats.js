$(function() {
    let promoEffect = $('#promoEffect');
    let bookingEffect = $('#bookingEffect');
    let subEffect = $('#subEffect');
    let promoCount = $('#promoCount');

    $.get('/get/stats/promo').done(function(promoStats) {
        let promoChart = new Chart(promoEffect, {
            type: 'horizontalBar',
            data: promoStats,
            options: {
                title: {
                    display: true,
                    text: 'Promotion Effectiveness'
                },
                legend: {
                    display: false
                },
                scales: {
                    xAxes: [{
                        display: false
                    }]
                }
            }
        });
    });

    $.get('/get/stats/bookings').done(function(bookingStats) {
        let bookingChart = new Chart(bookingEffect, {
            type: 'pie',
            data: bookingStats,
            options: {
                title: {
                    display: true,
                    text: 'Bookings From'
                }
            }
        });
    });


    $.get('/get/stats/subscriptions').done(function(subscriptionStats) {
        let subChart = new Chart(subEffect, {
            type: 'bar',
            data: subscriptionStats,
            options: {
                title: {
                    display: true,
                    text: 'Promotion Subscription'
                },
                legend: {
                    display: false
                },
                scales: {
                    yAxes: [{
                        display: false
                    }]
                }
            }
        });
    });

    $.get('/get/stats/count').done(function(countStats) {
        let countChart = new Chart(promoCount, {
            type: 'line',
            data: countStats,
            options: {
                title: {
                    display: true,
                    text: 'Promotion Messages'
                },
                legend: {
                    display: false
                }
            }
        });
    });
});