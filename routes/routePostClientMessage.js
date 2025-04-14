let Channels = require('../Channels')
let message = require('../message/message');

function routePostClientMessage(routeData, writeResponse, routeCompleted) {

    Channels.sendMessageToClient(
        routeData.postData.channel,
        routeData.postData.client,
        message(
            routeData.postData.message_type,
            routeData.postData.message,
            routeData.postData.payload,
            routeData.postData.payload_type
        )
    );

    routeCompleted();
}

module.exports = routePostClientMessage