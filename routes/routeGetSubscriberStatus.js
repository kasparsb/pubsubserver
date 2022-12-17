let ClientsList = require('../ClientsList')

function routeGetSubscriberStatus(query, writeResponse) {
    let client = ClientsList.findByClient(requestUrl.query.client);

    writeResponse(JSON.stringify({
        status: client && client.connection.connected ? 'connect' : 'disconnect'
    }));
}

module.exports = routeGetSubscriberStatus