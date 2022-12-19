let Mysql = require('../Mysql');


function consoleChannelsCreate(args, done) {

    Mysql.insert('channels', {
        name: args[0],
        listener_notify_endpoints: {
            subscriberStatusChange: [
                args[1]
            ],
            subscriberMessageRecieved: [
                args[2]
            ],
        },
        subscriber_notify: {
            subscriberStatusChange: args.length > 3 ? (parseInt(args[3], 10) ? true : false) : false,
            subscriberMessageRecieved: args.length > 4 ? (parseInt(args[4], 10) ? true : false) : false,
        }
    })

    done();
}


module.exports = consoleChannelsCreate