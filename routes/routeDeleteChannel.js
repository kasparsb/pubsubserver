let Channels = require('../Channels')


function routeDeleteChannel(routeData, writeResponse, routeCompleted) {
    if (routeData.params.channelId) {
        Channels.delete(routeData.params.channelId, function(){
            routeCompleted();
        });
    }
    else {
        routeCompleted();
    }
}

module.exports = routeDeleteChannel