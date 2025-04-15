let Channels = require('../Channels')

function socketCreateClient(request, connection) {
    let channel = Channels.findByName(request.resourceURL.query.channel)
    if (!channel) {
        console.log('CHANNEL NOT FOUND, Channel: '+request.resourceURL.query.channel);
        return;
    }

    let client = channel.connectClient(
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

    return client;
}
module.exports = socketCreateClient;
