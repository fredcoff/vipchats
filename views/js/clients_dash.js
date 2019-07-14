$(function() {
    $.get('/booking_stat').done(function(msgStats){
        let mtds = $("#booktable tbody tr td:last-child");
        $("#totalbooking").html("( Total : <font color='red'>"+msgStats["totalbooking"]+"</font> )");
        let p = msgStats["totalbooking"] ? (msgStats["new"]/msgStats["totalbooking"])*100+"%" : 0;
        $(mtds[0]).html( p);
        p = msgStats["totalbooking"] ? (msgStats["repeated"]/msgStats["totalbooking"])*100+"%" : 0;
        $(mtds[1]).html(p);
        p = msgStats["totalbooking"] ? (msgStats["promoted"]/msgStats["totalbooking"])*100+"%" : 0;
        $(mtds[2]).html(p);
    });

    $.get('/messages_by_type').done(function(msgStats){
        let mtds = $("#msgtable tbody tr td:last-child");

        $(mtds[0]).html( msgStats["welcome"][0]+"/"+msgStats["welcome"][1]);
        $(mtds[1]).html( msgStats["cancel"][0]+"/"+msgStats["cancel"][1]);
        $(mtds[2]).html( msgStats["promotion"][0]+"/"+msgStats["promotion"][1]);
        $(mtds[3]).html( msgStats["reminder"][0]+"/"+msgStats["reminder"][1]);
        $(mtds[4]).html( msgStats["confirm"][0]+"/"+msgStats["confirm"][1]);
    });


    let serviceStat = $('#serviceStat');
    $.get('/clients_by_service').done(function(data) {
        let serviceChart = new Chart(serviceStat, {
            type: 'bar',
            data: data.graph,
            options: {
                maintainAspectRatio: false,
                title: {
                    display: true,
                    fontSize:24,
                    text: 'Total Clients: '+data.total,
                    lineHeight:3,
                },
                legend: {
                    display: false
                },
                scales: {
                    yAxes: [{
                        display: false,
                        ticks: {
                            beginAtZero: true,
                            steps: 10,
                            stepValue: 5,
                            max: 100
                        }
                    }],
                    xAxes: [{
                        ticks: {
                            fontSize: 16,
                            stepSize: 1,
                            beginAtZero: true
                        }
                    }]
                },
                animation:{
                    duration:500,
                    onComplete: function () {
                        var chartInstance = this.chart,
                            ctx = chartInstance.ctx;
                        ctx.font = Chart.helpers.fontString(28, Chart.defaults.global.defaultFontStyle, Chart.defaults.global.defaultFontFamily);
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'bottom';

                        this.data.datasets.forEach(function (dataset, i) {
                            var meta = chartInstance.controller.getDatasetMeta(i);
                            meta.data.forEach(function (bar, index) {
                                var data = dataset.data[index];
                                ctx.fillText(data+" %", bar._model.x, bar._model.y - 5);
                            });
                        });
                    }
                }
            }
        });

    });


});