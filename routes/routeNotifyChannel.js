let ClientsList = require('../ClientsList');
let messageMessage = require('../message/message');

function routeNotifyChannel(query, writeResponse, routeCompleted) {
    ClientsList.notify(
        // Channel name
        query.channel,
        messageMessage(query.message)
    );

    routeCompleted();
}

module.exports = routeNotifyChannel
