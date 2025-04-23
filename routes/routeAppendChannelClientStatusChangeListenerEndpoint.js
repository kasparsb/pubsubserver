let Channels = require('../Channels')

function routeAppendChannelClientStatusChangeListenerEndpoint(routeData, writeResponse, routeCompleted) {
    if (!routeData.postData.endpoint) {
        routeCompleted();
    }

    let channel = Channels.find(routeData.postData.id);
    if (!channel) {
        routeCompleted();
        return;
    }

    channel.appendClientStatusChangeListenerEndpoint(routeData.postData.endpoint, function(){
        writeResponse(JSON.stringify(channel.getClientStatusChangeListenerEndpoints()))
        routeCompleted();
    })
}

module.exports = routeAppendChannelClientStatusChangeListenerEndpoint