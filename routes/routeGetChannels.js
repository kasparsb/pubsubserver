let Channels = require('../Channels')

/**
 * Admin route, atgriež visus reģistrētos channels
 */
function routeGetChannels(routeData, writeResponse, routeCompleted) {

    Channels.loadFromDb(function(rows){

        writeResponse(JSON.stringify(rows));

        routeCompleted();
    });

}

module.exports = routeGetChannels