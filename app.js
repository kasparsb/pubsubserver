
/**
 * run npx supervisor app.js
 */

const WebSocket = require('websocket');
const http = require('http');
const url = require('url');
const axios = require('axios');

let clients = {}

let server = http.createServer(function(request, response) {

    if (request.method == 'POST') {
        var requestUrl = url.parse(request.url, true);
        var path = requestUrl.pathname;
        // pieliekam trailing slash
        if (path.substr(-1) == '/') {
            path = path.substr(0, path.length-1);
        }

        if (path == '/message/client') {
            var body = '';
            request.on('data', function(data){
                body += data;
            })
            request.on('end', function(data){
                body = JSON.parse(body);
                var clientId = body.client_id;

                if (typeof clients[clientId] == 'undefined') {
                    console.log('no client with id '+clientId);
                    response.end();

                    return
                }

                // Expect data to be object
                console.log(body.data);
                clients[clientId].sendUTF(JSON.stringify(body.data));
            })
        }

    }

    response.end();
});

server.listen(80, '192.168.122.168', function() {
    console.log('litening 2');
});

let socketServer = new WebSocket.server({
    httpServer: server,
    autoAcceptConnections: false
});


socketServer.on('request', function(request) {
    //request.resourceURL.query.role
    // if (message.type === 'utf8')
    // if (message.type === 'binary')
    // connection.sendUTF(message.utf8Data);
    // connection.sendBytes(message.binaryData);
    // connection.remoteAddress

    //console.log('request', request.origin);
    //console.log(request.resourceURL.query);

    var clientId = request.resourceURL.query.client_id;

    if (clientId) {
        var connection = request.accept(null, request.origin);

        connection.on('message', function(message) {
            console.log('message', message.utf8Data)
        })

        connection.on('close', function(reasonCode, description) {
            console.log(connection.remoteAddress + ' disconnected.');

            notify(clientId, 'disconnected');
        });



        clients[clientId] = connection;

        notify(clientId, 'connected');
    }

})

function getAccountIdFromCookie(cookie) {
    axios.post('http://note.darbs.xyz/api/account/getid', {
        cookie: cookie
    })
        .then(response => {
            console.log(response.data);
        })
}

function notify(clientId, status) {
    console.log('notify', clientId, status);
    axios.post('http://note.darbs.xyz/api/account/socketstatus', {
        client_id: clientId,
        status: status
    })
        .then(response => {
            if (!response.data.success) {
                setTimeout(() => notify(clientId, status), 5000)
            }
        })
}