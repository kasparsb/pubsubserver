let ClientsList = require('../ClientsList')
let Channels = require('../Channels')

let messageStatus = require('../message/status');

function socketCreateClient(request, connection) {
    let client = Channels.connectClient(
        request.resourceURL.query.channel,
        connection,
        {
            ...request.resourceURL.query
        },
        {
            ip: connection.remoteAddress,
            socketVersion: connection.webSocketVersion
        }
    )

    if (client) {
        console.log('CONNECTED, channel: '+request.resourceURL.query.channel, client.dump());
    }
    else {
        console.log('CANT CONNECT, channel: '+request.resourceURL.query.channel);
    }

    // Channels.notifySubscriberStatusChange(
    //     subscriber.channel,
    //     messageStatus('connect', subscriber)
    // );

    return client;
}
module.exports = socketCreateClient;
