let ClientsList = require('../ClientsList')

function routeGetSubscriberStatus(query, writeResponse) {
    /**
     * @todo Jāskatās pēc channel+client
     */
    let client = ClientsList.findByClient(requestUrl.query.client);

    writeResponse(JSON.stringify({
        status: client && client.connection.connected ? 'connect' : 'disconnect'
    }));
}

module.exports = routeGetSubscriberStatus