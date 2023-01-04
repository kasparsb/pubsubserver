/**
 * run npx supervisor app.js
 */
let Mysql = require('./Mysql');
let Redis = require('./Redis');

let StateStore = require('./StateStore')
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
let routeChannelsUpdated = require('./routes/routeChannelsUpdated');
let routeSubscriberMessage = require('./routes/routeSubscriberMessage');
let routeSubscriberMessageCustom = require('./routes/routeSubscriberMessageCustom');
let routePostSubscriberMessageCustom = require('./routes/routePostSubscriberMessageCustom');

// Socket actions
let socketAcceptRequest = require('./socket/socketAcceptRequest');
let socketGetClient = require('./socket/socketGetClient');
let socketOnMessage = require('./socket/socketOnMessage');
let socketOnClose = require('./socket/socketOnClose');

const port = 70;

Redis.connect(function(){
    StateStore.cleanUp(function(){
        Mysql.connect(function(){
            Channels.loadFromDb(startServer)
        })
    })
})

function startServer() {

    ClientsList.removeInactiveEverySeconds(10);

    Route.default(routeDefault)
    Route.post('/channels/updated', routeChannelsUpdated)
    Route.get('/channel/notify', routeNotifyChannel)

    /**
     * @todod šito atstājam, tika legacy. Bet vajag nevis notify, bet message vai custom
     */
    Route.get('/subscriber/notify', routeNotifySubscriber)

    Route.get('/subscriber/message', routeSubscriberMessage);
    Route.get('/subscriber/send', routeSubscriberMessageCustom);
    Route.post('/subscriber/send', routePostSubscriberMessageCustom);


    Route.get('/subscriber/status', routeGetSubscriberStatus)
    Route.get('/log', routeShowLog)

    let server = createServer(port, '0.0.0.0', Route.all())

    let socketServer = createSocketServer(server)
    socketServer.acceptRequest(socketAcceptRequest)
    socketServer.getClient(socketGetClient)
    socketServer.onMessage(socketOnMessage)
    socketServer.onClose(socketOnClose)
}
