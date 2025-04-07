let Channels = require('../Channels');

function routeChannelsUpdated(query, postData, writeResponse, routeCompleted) {

    Channels.loadFromDb(function(){
        writeResponse('done');
        routeCompleted();
    })
}

module.exports = routeChannelsUpdated