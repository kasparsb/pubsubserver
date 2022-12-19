let ClientsList = require('../ClientsList')
let Channels = require('../Channels')

let messageStatus = require('../message/status');

function socketGetClient(request, connection) {
    let client = ClientsList.add(
        request.resourceURL.query.channel,
        connection,
        {
            ...request.resourceURL.query
        },
        connection.remoteAddress,
        connection.webSocketVersion
    );

    console.log('CONNECTED '+client.data?.client+'@'+client.channel);

    Channels.notifySubscriberStatusChange(
        client.channel,
        messageStatus('connect', client)
    );

    return client;
}
module.exports = socketGetClient;
