let Channels = require('../Channels');

function routeChannelsUpdated(query, writeResponse, routeCompleted) {

    Channels.loadFromDb(function(){
        writeResponse('done');
        routeCompleted();
    })
}

module.exports = routeChannelsUpdated