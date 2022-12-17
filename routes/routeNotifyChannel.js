let Channels = require('../Channels');

function routeNotifyChannel(query, writeResponse) {
    Channels.notifyMessage(query.channel, query.message);
}

module.exports = routeNotifyChannel