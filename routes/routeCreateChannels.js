let Channels = require('../Channels')

/**
 * Admin route, izveidot channel
 */
function routeCreateChannels(routeData, writeResponse, routeCompleted) {

    Channels.createOrUpdate(routeData.postData, function(){
        routeCompleted();
    });

}

module.exports = routeCreateChannels