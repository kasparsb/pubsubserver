let Channels = require('../Channels')


function routeUpdateChannel(routeData, writeResponse, routeCompleted) {

    let data = routeData.postData;
    data.id = routeData.params.channelId;

    if (data.id) {
        Channels.createOrUpdate(data, function(){
            routeCompleted();
        });
    }
    else {
        routeCompleted();
    }
}

module.exports = routeUpdateChannel