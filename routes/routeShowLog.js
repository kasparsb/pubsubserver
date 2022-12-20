let ClientsList = require('../ClientsList')

function routeShowLog(query, writeResponse, routeCompleted) {
    ClientsList.clients.forEach(client => {

        //if (!client.connection.connected || client.disconnectAt) {

            //client.pingAt = (new Date()).getTime();

            //console.log('ping disconnected');
            //client.connection.sendUTF(JSON.stringify({type:'ping'}))
        //}

        let disconnectDuration = '';
        if (client.disconnectAt) {
            disconnectDuration = 'discdur '+client.disconnectAt.duration()+' ';
        }
        let lastMessageDuration = '';
        if (client.lastMessageAt) {
            lastMessageDuration = 'lastmsg '+client.lastMessageAt.duration()+' ';
        }

        writeResponse(
            client.data.client.substring(0, 10)+' '+
            disconnectDuration+
            lastMessageDuration+
            (client.connection.connected ? 'connected' : 'disconnected')+' '+
            client.channel+' '+
            //client.connection.webSocketVersion+' '+
            client.connection.remoteAddress+' '+
            '\n'
        );

        routeCompleted();
    })
}

module.exports = routeShowLog