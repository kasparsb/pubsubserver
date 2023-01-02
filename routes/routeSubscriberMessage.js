let ClientsList = require('../ClientsList')
let messageMessage = require('../message/message');

function routeSubscriberMessage(query, writeResponse, routeCompleted) {
    ClientsList.notifyBySubscriber(
        // Channel name
        query.channel,
        // Client name
        query.client,
        // app server message, tāpēc netiek padots sender
        messageMessage(query.message, query.payload)
    );

    routeCompleted();
}

module.exports = routeSubscriberMessage
