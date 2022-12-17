let Mysql = require('../Mysql');


function consoleChannelsCreate(args, done) {

    Mysql.insert('channels', {
        name: args[0],
        notify_endpoints: {
            subscriberStatusChange: [
                args[1]
            ],
            subscriberMessageRecieved: [
                args[2]
            ],
        }
    })

    done();
}


module.exports = consoleChannelsCreate