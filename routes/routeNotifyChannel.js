let ClientsList = require('../ClientsList');
let messageMessage = require('../message/message');

function routeNotifyChannel(query, writeResponse) {
    ClientsList.notify(
        // Channel name
        query.channel,
        messageMessage(query.message)
    );
}

module.exports = routeNotifyChannel
