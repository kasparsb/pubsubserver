let Channels = require('../Channels')

function routeRemoveChannelClientStatusChangeListenerEndpoint(routeData, writeResponse, routeCompleted) {
    if (!routeData.postData.endpoint) {
        routeCompleted();
    }

    let channel = Channels.find(routeData.postData.id);
    if (!channel) {
        routeCompleted();
    }

    channel.removeClientStatusChangeListenerEndpoint(routeData.postData.endpoint, function(){
        writeResponse(JSON.stringify(channel.getClientStatusChangeListenerEndpoints()))
        routeCompleted();
    })
}

module.exports = routeRemoveChannelClientStatusChangeListenerEndpoint