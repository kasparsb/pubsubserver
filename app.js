/**
 * run npx supervisor app.js
 */
let Mysql = require('./Mysql');
let Redis = require('./Redis');

let StateStore = require('./StateStore')
let Channels = require('./Channels');

let Route = require('./Route');
let createServer = require('./createServer');
let createSocketServer = require('./createSocketServer');

// Routes
let routeDefault = require('./routes/routeDefault');
let routeHealth = require('./routes/routeHealth');
let routeGetClientStatus = require('./routes/routeGetClientStatus');
let routePostClientMessage = require('./routes/routePostClientMessage');
let routePostChannelMessage = require('./routes/routePostChannelMessage');
let routePostTopicMessage = require('./routes/routePostTopicMessage');

let routeGetChannels = require('./routes/routeGetChannels');
let routeCreateChannels = require('./routes/routeCreateChannels');
let routeChannel = require('./routes/routeChannel');
let routeUpdateChannel = require('./routes/routeUpdateChannel');
let routeDeleteChannel = require('./routes/routeDeleteChannel');
let routeAppendChannelClientStatusChangeListenerEndpoint = require('./routes/routeAppendChannelClientStatusChangeListenerEndpoint');
let routeRemoveChannelClientStatusChangeListenerEndpoint = require('./routes/routeRemoveChannelClientStatusChangeListenerEndpoint');

// Socket actions
let socketCanAcceptRequest = require('./socket/socketCanAcceptRequest');
let socketCreateClient = require('./socket/socketCreateClient');
let socketOnMessage = require('./socket/socketOnMessage');
let socketOnClose = require('./socket/socketOnClose');

const port = 80;

Redis.connect(function(){
    StateStore.cleanUp(function(){
        Mysql.connect(function(){
            Channels.loadFromDb(startServer)
        })
    })
})

function startServer() {

    Channels.removeInactiveEverySeconds(60);

    Route.default(routeDefault)

    Route.post('/channel/message', routePostChannelMessage);
    Route.post('/topic/message', routePostTopicMessage);
    Route.post('/client/message', routePostClientMessage);

    Route.get('/client/status', routeGetClientStatus)
    Route.get('/health', routeHealth)

    // Admin routes
    Route.get('/channels', routeGetChannels)
    Route.post('/channels', routeCreateChannels);
    Route.get('/channels/{channelId}', routeChannel);
    Route.post('/channels/{channelId}', routeUpdateChannel);
    Route.delete('/channels/{channelId}', routeDeleteChannel);
    // Pievienu vai novāc endpoint
    Route.post('/channel-listener-endpoint/client-status-change', routeAppendChannelClientStatusChangeListenerEndpoint);
    Route.delete('/channel-listener-endpoint/client-status-change', routeRemoveChannelClientStatusChangeListenerEndpoint);


    let server = createServer(port, '0.0.0.0', Route.all())
    let socketServer = createSocketServer(server)
    socketServer.setCanAcceptRequestFunction(socketCanAcceptRequest)
    socketServer.setCreateClientFunction(socketCreateClient)
    socketServer.onMessage(socketOnMessage)
    socketServer.onClose(socketOnClose)
}
