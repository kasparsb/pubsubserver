let Mysql = require('../Mysql');
let formatDate = require('../helpers/formatDate');

Mysql.connect(function(){
    Mysql.insertOrUpdate('channel_subscriber_statuses', {
        channel_id: 1,
        subscriber_id: 'werwer',
        connected_at: formatDate.ymdhis(new Date())
    }, {
        subscriber_id: 'werwer'
    }, function(){
        console.log('done');

        Mysql.disconnect();
    });
})
