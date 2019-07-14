$(function() {
    let $bookingModal = $('#bookingsModal');

    $.get('/get/clients/all').done(function(clients) {
        $('#clientTable').dynatable({
            dataset: { records: clients },
            features: {
                search: false,
                recordCount: false,
                perPageSelect: false
            },
            table: { headRowSelector: 'thead tr' }
        }).on('click', 'tr', function() {
            let phone = $($(this).find('td')[1]).text();

            $.get('/get/bookings/' + phone).done(function(bookings) {
                console.log(bookings);

                let dynatable = $('#bookingTable').dynatable({
                    dataset: { records: bookings },
                    features: {
                        search: false,
                        recordCount: false,
                        perPageSelect: false
                    },
                    table: { headRowSelector: 'thead tr' }
                }).data('dynatable');

                dynatable.settings.dataset.originalRecords = bookings;
                dynatable.process();
                $bookingModal.modal('toggle');
            });
        });
    });

    $('#refreshTime').text(new Date().toLocaleTimeString());
});