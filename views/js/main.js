$(function() {
    let $bookingModal = $('#bookingsModal');

    $.get('/get/clients/all').done(function(clients) {
        for(let i = 0; i<clients.length; i++){
            clients[i]['is_protect'] = clients[i]['is_protect']?'<div><i class="fa fa-shield fa-2x" style="color: #00bfff;"></i></div>':'';
            clients[i]['is_promo'] = clients[i]['is_promo']?'<div><i class="fa fa-thumbs-up fa-2x" style="color: #00bfff;"></i></div>':'';
            clients[i]['is_parking'] = clients[i]['is_parking']?'<div><i class="fa fa-car fa-2x" style="color: #00bfff;"></i></div>':'';
            clients[i]['is_checkin'] = clients[i]['is_checkin']?'<div><i class="fa fa-check fa-2x" style="color: #00bfff;"></i></div>':'';
        }
        $('#clientTable').dynatable({
            dataset: { records: clients },
            features: {
                search: false,
                recordCount: false,
                perPageSelect: false
            },
            table: { headRowSelector: 'thead tr' }
        }).on('click', 'tr', function() {
            const id =$($(this).find('td')[0]).text();
            location.href = "/clients_single/"+id;
            return;
            //==================================
            let phone = $($(this).find('td')[3]).text();

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