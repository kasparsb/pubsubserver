let ClientsList = require('../ClientsList')
let Channels = require('../Channels')

let messageStatus = require('../message/status');

function socketGetClient(request, connection) {
    let channel = Channels.get(request.resourceURL.query.channel);

    if (!channel) {
        console.log('Channel not found '+request.resourceURL.query.channel);
    }

    let subscriber = ClientsList.connect(
        channel,
        connection,
        {
            ...request.resourceURL.query
        },
        connection.remoteAddress,
        connection.webSocketVersion
    );

    console.log('CONNECTED '+subscriber.data.client+'@'+subscriber.channel.name);

    Channels.notifySubscriberStatusChange(
        subscriber.channel,
        messageStatus('connect', subscriber)
    );

    return subscriber;
}
module.exports = socketGetClient;
