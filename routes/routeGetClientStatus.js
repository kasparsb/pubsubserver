let Channels = require('../Channels')

function routeGetClientStatus(routeData, writeResponse, routeCompleted) {

    let client = Channels.getClient(routeData.query.channel, routeData.query.client)

    writeResponse(JSON.stringify({
        status: client && client.connection.connected ? 'connect' : 'disconnect'
    }));

    routeCompleted();
}

module.exports = routeGetClientStatus