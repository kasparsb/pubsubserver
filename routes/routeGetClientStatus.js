let Channels = require('../Channels')

function routeGetClientStatus(query, writeResponse, routeCompleted) {

    let client = Channels.getClient(query.channel, query.client)

    writeResponse(JSON.stringify({
        status: client && client.connection.connected ? 'connect' : 'disconnect'
    }));

    routeCompleted();
}

module.exports = routeGetClientStatus