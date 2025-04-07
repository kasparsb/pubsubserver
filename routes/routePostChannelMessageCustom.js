let ClientsList = require('../ClientsList')
let messageCustom = require('../message/custom');

function routePostChannelMessageCustom(query, postData, writeResponse, routeCompleted) {

    let payload = null;

    if (typeof postData.payload != 'undefined') {
        try {
            payload = JSON.parse(postData.payload);
        }
        catch(e) {

        }
    }

    ClientsList.notifyChannel(
        postData.channel,
        messageCustom(
            postData.message_type,
            postData.message,
            payload
        )
    );

    routeCompleted();
}

module.exports = routePostChannelMessageCustom