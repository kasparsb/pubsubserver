let Mysql = require('../Mysql');
let formatDate = require('../helpers/formatDate');

// Veidojam daudz channel_subscriber_statuses ierakstus
// priekš testēšanas

Mysql.connect(function(){

    let connectedAt = new Date();
    connectedAt.setDate(28);
    connectedAt.setHours(22);
    connectedAt.setMinutes(1)

    for (let i = 0; i < 100000; i++) {
        Mysql.insert('channel_subscriber_statuses', {
            channel_id: 1000,
            subscriber_id: 'asd',
            disconnected_at: formatDate.ymdhis(connectedAt),
            connected_at: formatDate.ymdhis(connectedAt),
            pong_at: formatDate.ymdhis(connectedAt),
        }, function(id){
            console.log(id);
        });
    }


})
