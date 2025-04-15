let Channels = require('../Channels')


function routeChannel(routeData, writeResponse, routeCompleted) {

    let channel = Channels.find(routeData.params.channelId);

    if (channel) {
        writeResponse(JSON.stringify(channel.data));
    }
    else {
        writeResponse(JSON.stringify(null));
    }

    routeCompleted();

}

module.exports = routeChannel