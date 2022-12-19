let Mysql = require('../Mysql');
let Channels = require('../Channels');

function consoleChannelsShow(args, done) {

    Channels.loadFromDb(function(){

        Channels.getChannels().forEach(channel => {
            console.log(channel.name+' ('+channel.id+')');
            console.log('listenerNotifyEndpoints.subscriberStatusChange');
            channel.listenerNotifyEndpoints.subscriberStatusChange.forEach(url => console.log('    '+url));
            console.log('listenerNotifyEndpoints.subscriberMessageRecieved');
            channel.listenerNotifyEndpoints.subscriberMessageRecieved.forEach(url => console.log('    '+url));
            console.log('subscriberNotify.subscriberStatusChange '+(channel.subscriberNotify.subscriberStatusChange ? 'true' : 'false'));
            console.log('subscriberNotify.subscriberMessageRecieved '+(channel.subscriberNotify.subscriberMessageRecieved ? 'true' : 'false'));

            console.log('--------------------------------------------------');
        })

        done();

    })

}


module.exports = consoleChannelsShow