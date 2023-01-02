let Mysql = require('../Mysql');

Mysql.connect(function(){
    Mysql.chunk(
        10000,
         ' SELECT id '
        +' FROM channel_subscriber_statuses '
        +' WHERE '
        +'   disconnected_at IS NOT NULL '
        +'   AND pong_at < DATE_SUB(NOW(), INTERVAL 5 MINUTE)'
        +' ORDER BY id ASC',
        function(results){
            let ids = [];
            results.forEach(function(result){
                ids.push(result.id);
            })

            Mysql.query('UPDATE channel_subscriber_statuses SET disconnected_at=? WHERE id IN ('+ids.join(',')+')', [Mysql.now()]);

            console.log(ids[0]);
        },
        function(){
            Mysql.disconnect();
        }
    )
})