let WebSocket = require('websocket');
let timer = require('./timer');

/**
 * Default event listeners
 */
let acceptRequest = function(request) {
    return false;
}

let getClient = function(request, connection) {
}

let onMessage = function(client, message) {
}

let onClose = function(client, reasonCode, description) {
}

function createSocketServer(server, callbacks) {

    let socketServer = new WebSocket.server({
        httpServer: server,
        autoAcceptConnections: false
    });


    socketServer.on('request', function(request) {

        if (!acceptRequest(request)) {
            request.reject();
            return;
        }

        let connection = request.accept(null, request.origin);
        let client = getClient(request, connection);

        connection.on('message', function(message) {
            onMessage(client, message);
        })

        connection.on('close', function(reasonCode, description) {
            onClose(client, reasonCode, description);
        })

    })

    // Atgriežam event listeners
    return {
        acceptRequest: function(cb) {
            acceptRequest = cb
        },
        getClient: function(cb) {
            getClient = cb
        },
        onMessage: function(cb) {
            onMessage = cb
        },
        onClose: function(cb) {
            onClose = cb
        }
    }
}

module.exports = createSocketServer;