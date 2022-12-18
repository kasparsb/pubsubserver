let ClientsList = require('../ClientsList');

function routeNotifyChannel(query, writeResponse) {
    ClientsList.notify(query.channel, query.message);
}

module.exports = routeNotifyChannel