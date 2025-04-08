let Channels = require('../Channels')
let message = require('../message/message');

function routePostClientMessage(query, postData, writeResponse, routeCompleted) {

    Channels.sendMessageToClient(
        postData.channel,
        postData.client,
        message(
            postData.message_type,
            postData.message,
            postData.payload,
            postData.payload_type
        )
    );

    routeCompleted();
}

module.exports = routePostClientMessage