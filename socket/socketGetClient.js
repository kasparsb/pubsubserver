let ClientsList = require('../ClientsList')
let Channels = require('../Channels')

function socketGetClient(request, connection) {
    let client = ClientsList.add(
        request.resourceURL.query.channel,
        connection,
        {
            socketVersion: connection.webSocketVersion,
            ip: connection.remoteAddress,
            ...request.resourceURL.query
        }
    );

    console.log('CONNECTED '+client.data?.client+'@'+client.channel);

    Channels.notifySubscriberStatusChange(client.channel, client.data, 'connect');

    return client;
}
module.exports = socketGetClient;
