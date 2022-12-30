let Mysql = require('../Mysql');
let formatDate = require('../helpers/formatDate');

Mysql.connect(function(){
    Mysql.insert('channel_subscriber_statuses', {
        channel_id: 1,
        subscriber_id: 'asdasdsdfsdf',
        connected_at: formatDate.ymdhis(new Date())
    }, function(insertId){
        console.log('inserted');
        console.log(insertId);

        Mysql.disconnect();
    });
})
