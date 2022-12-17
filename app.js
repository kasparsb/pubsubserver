/**
 * run npx supervisor app.js
 */
let Mysql = require('./Mysql');

let WebSocket = require('websocket');
let http = require('http');
let url = require('url');
//let axios = require('axios');
let ClientsList = require('./ClientsList')
let Channels = require('./Channels');
let timer = require('./timer');

let Route = require('./Route');
let createServer = require('./createServer');
let createSocketServer = require('./createSocketServer');

// Routes
let routeDefault = require('./routes/routeDefault');
let routeGetSubscriberStatus = require('./routes/routeGetSubscriberStatus');
let routeNotifyChannel = require('./routes/routeNotifyChannel');
let routeNotifySubscriber = require('./routes/routeNotifySubscriber');
let routeShowLog = require('./routes/routeShowLog');

// Socket actions
let socketAcceptRequest = require('./socket/socketAcceptRequest');
let socketGetClient = require('./socket/socketGetClient');
let socketOnMessage = require('./socket/socketOnMessage');
let socketOnClose = require('./socket/socketOnClose');

const port = 70;

Mysql.connect(dbConnected);

function dbConnected() {
    Channels.loadFromDb(startServer)
}

function startServer() {

    ClientsList.removeInactiveEverySeconds(10);

    Route.get('/channel/notify', routeNotifyChannel)
    Route.get('/subscriber/notify', routeNotifySubscriber)
    Route.get('/subscriber/status', routeGetSubscriberStatus)
    Route.get('/log', routeShowLog)
    // Route which responds to any not defined route
    Route.default(routeDefault)

    let server = createServer(port, '0.0.0.0', Route.all())

    let socketServer = createSocketServer(server)
    socketServer.acceptRequest(socketAcceptRequest)
    socketServer.getClient(socketGetClient)
    socketServer.onMessage(socketOnMessage)
    socketServer.onClose(socketOnClose)
}
