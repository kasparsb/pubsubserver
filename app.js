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
//let routeChannelsUpdated = require('./routes/routeChannelsUpdated');
let routeDefault = require('./routes/routeDefault');
let routeHealth = require('./routes/routeHealth');
let routeGetClientStatus = require('./routes/routeGetClientStatus');
let routePostClientMessage = require('./routes/routePostClientMessage');
let routePostChannelMessage = require('./routes/routePostChannelMessage');
let routePostTopicMessage = require('./routes/routePostTopicMessage');

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

    ClientsList.removeInactiveEverySeconds(10);

    Route.default(routeDefault)

    Route.post('/channel/message', routePostChannelMessage);
    Route.post('/topic/message', routePostTopicMessage);
    Route.post('/client/message', routePostClientMessage);

    Route.get('/client/status', routeGetClientStatus)
    Route.get('/health', routeHealth)


    /**
     * TODO šo jāvāc ārā, jo kanāli tiks iesūtīti pa rest api
     * nevis kā līdz šim updated datubāzē un tad šeit padod
     * ziņu, ka jauni kanāli ienākuši
     */
    //Route.post('/channels/updated', routeChannelsUpdated);






    /**
     * @todod šito atstājam, tika legacy. Bet vajag nevis notify, bet message vai custom
     */
    // Route.get('/channel/notify', routeNotifyChannel)
    // Route.get('/subscriber/notify', routeNotifySubscriber)

    // Route.post('/channel/send', routePostChannelMessageCustom)

    // Route.get('/subscriber/message', routeSubscriberMessage);
    // Route.get('/subscriber/send', routeSubscriberMessageCustom);
    // Route.post('/subscriber/send', routePostSubscriberMessageCustom);




    let server = createServer(port, '0.0.0.0', Route.all())



    let socketServer = createSocketServer(server)
    socketServer.setCanAcceptRequestFunction(socketCanAcceptRequest)
    socketServer.setCreateClientFunction(socketCreateClient)
    socketServer.onMessage(socketOnMessage)
    socketServer.onClose(socketOnClose)
}
