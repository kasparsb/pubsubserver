let ClientsList = require('../ClientsList')
let messageCustom = require('../message/custom');

function routePostSubscriberMessageCustom(query, postData, writeResponse, routeCompleted) {

    let payload = null;

    if (typeof postData.payload != 'undefined') {
        try {
            payload = JSON.parse(postData.payload);
        }
        catch(e) {

        }
    }

    ClientsList.notifyBySubscriber(
        postData.channel,
        postData.client,
        messageCustom(
            postData.message_type,
            postData.message,
            payload
        )
    );

    routeCompleted();
}

module.exports = routePostSubscriberMessageCustom