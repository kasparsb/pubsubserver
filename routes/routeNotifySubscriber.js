let ClientsList = require('../ClientsList')
let messageMessage = require('../message/message');

function routeNotifySubscriber(query, writeResponse) {
    ClientsList.notifyBySubscriber(
        // Channel name
        query.channel,
        // Client name
        query.client,
        // app server message, tāpēc netiek padots sender
        messageMessage(query.message, query.payload)
    );
}

module.exports = routeNotifySubscriber



// if (request.method == 'POST') {
    //     var requestUrl = url.parse(request.url, true);
    //     var path = requestUrl.pathname;
    //     // pieliekam trailing slash
    //     if (path.substr(-1) == '/') {
    //         path = path.substr(0, path.length-1);
    //     }

    //     if (path == '/message/client') {
    //         var body = '';
    //         request.on('data', function(data){
    //             body += data;
    //         })
    //         request.on('end', function(data){
    //             body = JSON.parse(body);
    //             var clientId = body.client_id;

    //             if (typeof clients[clientId] == 'undefined') {
    //                 console.log('no client with id '+clientId);
    //                 response.end();

    //                 return
    //             }

    //             // Expect data to be object
    //             console.log(body.data);
    //             clients[clientId].sendUTF(JSON.stringify(body.data));
    //         })
    //     }

    // }