let ClientsList = require('../ClientsList');
let messageMessage = require('../message/message');

function routeNotifyChannel(query, writeResponse, routeCompleted) {
    ClientsList.notifyChannel(
        // Channel name
        query.channel,
        messageMessage(query.message, query.payload)
    );

    routeCompleted();
}

module.exports = routeNotifyChannel
