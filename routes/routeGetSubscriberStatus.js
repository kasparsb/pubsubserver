let ClientsList = require('../ClientsList')

function routeGetSubscriberStatus(query, writeResponse, routeCompleted) {
    /**
     * @todo Jāskatās pēc channel+client
     */
    let client = ClientsList.findByClient(query.client);

    writeResponse(JSON.stringify({
        status: client && client.connection.connected ? 'connect' : 'disconnect'
    }));

    routeCompleted();
}

module.exports = routeGetSubscriberStatus