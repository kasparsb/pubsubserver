let ClientsList = require('../ClientsList')
let messageCustom = require('../message/custom');

function routeSubscriberMessageCustom(query, writeResponse, routeCompleted) {

    let payload = null;

    if (typeof query.payload != 'undefined') {
        try {
            payload = JSON.parse(query.payload);
        }
        catch(e) {

        }
    }

    ClientsList.notifyBySubscriber(
        query.channel,
        query.client,
        messageCustom(
            query.message_type,
            query.message,
            payload
        )
    );

    routeCompleted();
}

module.exports = routeSubscriberMessageCustom