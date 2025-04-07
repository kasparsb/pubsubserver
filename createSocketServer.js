let WebSocket = require('websocket');
let timer = require('./timer');

/**
 * Default event listeners
 */
function canAcceptRequest(request) {}
function createClient(request, connection) {}
function onMessage(client, message) {}
function onClose(client, reasonCode, description) {}

function createSocketServer(server, callbacks) {

    let socketServer = new WebSocket.server({
        httpServer: server,
        autoAcceptConnections: false
    });


    socketServer.on('request', function(request) {

        if (!canAcceptRequest(request)) {
            request.reject();
            return;
        }

        let connection = request.accept(null, request.origin);
        let client = createClient(request, connection);

        connection.on('message', function(message) {
            onMessage(client, message);
        })

        connection.on('close', function(reasonCode, description) {
            onClose(client, reasonCode, description);
        })

    })

    // Atgriežam event listeners
    return {
        onMessage: function(cb) {
            onMessage = cb
        },
        onClose: function(cb) {
            onClose = cb
        },

        /**
         * Padod funkciju, kura nosaka vai drīst accept request
         */
        setCanAcceptRequestFunction: function(cb) {
            canAcceptRequest = cb
        },
        /**
         * Šeit tiek padota funkcija, kura izveido client objektu
         * šis client objekts tiks padots tālāk uz onMessage un onClose callbacks
         */
        setCreateClientFunction: function(cb) {
            createClient = cb
        }
    }
}

module.exports = createSocketServer;