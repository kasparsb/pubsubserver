let Mysql = require('../Mysql');
let formatDate = require('../helpers/formatDate');

Mysql.connect(function(){
    Mysql.update('channel_subscriber_statuses', {
        channel_id: 1,
        subscriber_id: 'asdasd2222',
        disconnected_at: formatDate.ymdhis(new Date())
    }, {
        id: 1
    }, function(){
        console.log('updated');

        Mysql.disconnect();
    });
})
