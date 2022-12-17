let Mysql = require('../Mysql');
let Channels = require('../Channels');

function consoleChannelsShow(args, done) {

    Channels.loadFromDb(function(){

        Channels.getChannels().forEach(channel => {
            console.log(
                channel.dbid+' | '+
                channel.id+' | '+
                channel.notifyEndpoints.subscriberStatusChange.join('; ')+' | '+
                channel.notifyEndpoints.subscriberMessageRecieved.join('; ')
            )
        })

        done();

    })

}


module.exports = consoleChannelsShow