$(function() {
    let bookingEffect = $('#bookingEffect');
    let bookingEffect2 = $('#bookingEffect2');

    $.get('/admin_api_hotelmsgstat').done(function(data){
        let chartdata = {"datasets":[{"data":[0,0,0],"backgroundColor":["#36a2eb","#33ff33","#eeee1a"]}],
            "labels":["Trial","Subscribers","Expired"]};
        for ( let i=0; i < data.length ; i++) {
            if (data[i]['_id'] == "Trial") {
                chartdata["datasets"][0]["data"][0] = data[i]['count'];
                chartdata["labels"][0] = "Trial ("+data[i]['count']+")";
            }
            if (data[i]['_id'] == "Paid") {
                chartdata["datasets"][0]["data"][1] = data[i]['count'];
                chartdata["labels"][1] = "Subscribers ("+data[i]['count']+")";
            }

            if (data[i]['_id'] == "Expired") {
                chartdata["datasets"][0]["data"][2] = data[i]['count'];
                chartdata["labels"][2] = "Expired ("+data[i]['count']+")";
            }
        }
        let bookingChart = new Chart(bookingEffect, {
            type: 'pie',
            data: chartdata,
            options: {
                title: {
                    display: true,
                    fontSize:24,
                    text: 'Total Number Hotels Message'
                },
                animation: {
                    duration: 500,
                    easing: "easeOutQuart",
                    onComplete: function () {
                        var ctx = this.chart.ctx;
                        ctx.font = Chart.helpers.fontString(28, Chart.defaults.global.defaultFontStyle, Chart.defaults.global.defaultFontFamily);
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'bottom';

                        this.data.datasets.forEach(function (dataset) {

                            for (var i = 0; i < dataset.data.length; i++) {
                                var model = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._model,
                                    total = dataset._meta[Object.keys(dataset._meta)[0]].total,
                                    mid_radius = model.innerRadius + (model.outerRadius - model.innerRadius)/2,
                                    start_angle = model.startAngle,
                                    end_angle = model.endAngle,
                                    mid_angle = start_angle + (end_angle - start_angle)/2;

                                var x = mid_radius * Math.cos(mid_angle);
                                var y = mid_radius * Math.sin(mid_angle);

                                ctx.fillStyle = '#fff';
                                if (i == 3){ // Darker text color for lighter background
                                    ctx.fillStyle = '#444';
                                }
                                var percent = String(Math.round(dataset.data[i]/total*100)) + "%";
                                // ctx.fillText(dataset.data[i], model.x + x, model.y + y);
                                // Display percent in another line, line break doesn't work for fillText
                                ctx.fillText(percent, model.x + x, model.y + y + 15);
                            }
                        });
                    }
                    //================
                }
            }
        });
    });

    $.get('/admin_api_hotelsignstat').done(function(data){
        let chartdata = {"datasets":[{"data":[0,0,0],"backgroundColor":["#36a2eb","#33ff33","#eeee1a"]}],
            "labels":["Trial","Subscribers","Expired"]};
        for ( let i=0; i < data.length ; i++) {
            if (data[i]['_id'] == "Trial") {
                chartdata["datasets"][0]["data"][0] = data[i]['count'];
                chartdata["labels"][0] = "Trial ("+data[i]['count']+")";
            }
            if (data[i]['_id'] == "Paid") {
                chartdata["datasets"][0]["data"][1] = data[i]['count'];
                chartdata["labels"][1] = "Subscribers ("+data[i]['count']+")";
            }

            if (data[i]['_id'] == "Expired") {
                chartdata["datasets"][0]["data"][2] = data[i]['count'];
                chartdata["labels"][2] = "Expired ("+data[i]['count']+")";
            }
        }
        let bookingChart2 = new Chart(bookingEffect2, {
            type: 'pie',
            data: chartdata,
            options: {
                title: {
                    display: true,
                    fontSize:24,
                    text: 'Total Number Hotels Signature'
                },
                animation: {
                    duration: 500,
                    easing: "easeOutQuart",
                    onComplete: function () {
                        var ctx = this.chart.ctx;
                        ctx.font = Chart.helpers.fontString(28, Chart.defaults.global.defaultFontStyle, Chart.defaults.global.defaultFontFamily);
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'bottom';

                        this.data.datasets.forEach(function (dataset) {

                            for (var i = 0; i < dataset.data.length; i++) {
                                var model = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._model,
                                    total = dataset._meta[Object.keys(dataset._meta)[0]].total,
                                    mid_radius = model.innerRadius + (model.outerRadius - model.innerRadius)/2,
                                    start_angle = model.startAngle,
                                    end_angle = model.endAngle,
                                    mid_angle = start_angle + (end_angle - start_angle)/2;

                                var x = mid_radius * Math.cos(mid_angle);
                                var y = mid_radius * Math.sin(mid_angle);

                                ctx.fillStyle = '#fff';
                                if (i == 3){ // Darker text color for lighter background
                                    ctx.fillStyle = '#444';
                                }
                                var percent = String(Math.round(dataset.data[i]/total*100)) + "%";
                                // ctx.fillText(dataset.data[i], model.x + x, model.y + y);
                                // Display percent in another line, line break doesn't work for fillText
                                ctx.fillText(percent, model.x + x, model.y + y + 15);
                            }
                        });
                    }
                    //================
                }
            }
        });
    });

});