/**
 * run npx supervisor app.js
 */

let WebSocket = require('websocket');
let http = require('http');
let url = require('url');
let axios = require('axios');
let ClientsList = require('./ClientsList')
let Channels = require('./Channels');
let timer = require('./timer');

const port = 70;

Channels.setChannels([
    {
        id: 'chat',
        subscriberStatusUrl: [
            'http://consents.darbs.xyz:8065/chat/status',
        ],
        subscriberMessageUrl: [
            'http://consents.darbs.xyz:8065/chat/message',
        ]
    },

    {
        id: 'tablet',
        // Uz šo url sūta subscriber statusu (connect, disconnect)
        subscriberStatusUrl: [
            //'https://eoqz0h8uhdyx9lj.m.pipedream.net',
            'http://consents.darbs.xyz:8065/api/tablet/status',
        ],
        // Uz šo url sūta ienākošo message no subscriber
        subscriberMessageUrl: [
            //'https://eoqz0h8uhdyx9lj.m.pipedream.net',
            'http://consents.darbs.xyz:8065/api/tablet/message',
        ]
    },
    {
        id: 'admin',
        // Uz šo url sūta subscriber statusu (connect, disconnect)
        subscriberStatusUrl: [
            //'https://eoqz0h8uhdyx9lj.m.pipedream.net',
            'http://consents.darbs.xyz:8065/api/tablet/status',
        ],
        // Uz šo url sūta ienākošo message no subscriber
        subscriberMessageUrl: [
            //'https://eoqz0h8uhdyx9lj.m.pipedream.net',
            'http://consents.darbs.xyz:8065/api/tablet/message',
        ]
    }
]);

let clients = new ClientsList();

setInterval(() => clients.removeInactive(), 10000);


let server = http.createServer(function(request, response) {

    let requestUrl = url.parse(request.url, true)

    if (requestUrl.pathname != '/log') {
        console.log('http request '+request.method+' '+request.url);
    }


    // Dotam ziņojumu visiem kanāla subscribers
    if (requestUrl.pathname == '/channel/notify') {
        clients.notify(requestUrl.query.channel, requestUrl.query.message);
    }
    else if (requestUrl.pathname == '/subscriber/notify') {
        clients.notifyByClient(requestUrl.query.channel, requestUrl.query.client, requestUrl.query.message, requestUrl.query.payload);
    }
    // Klienta connection status
    else if (requestUrl.pathname == '/subscriber/status') {
        let client = clients.findByClient(requestUrl.query.client);
        if (client && client.connection.connected) {
            response.write(JSON.stringify({status: 'connect'}));
        }
        else {
            response.write(JSON.stringify({status: 'disconnect'}));
        }
    }
    // Log all channels and subscribers
    else if (requestUrl.pathname == '/log') {
        clients.clients.forEach(client => {

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

            response.write(
                client.data.client.substring(0, 10)+' '+
                disconnectDuration+
                lastMessageDuration+
                (client.connection.connected ? 'connected' : 'disconnected')+' '+
                client.channel+' '+
                //client.connection.webSocketVersion+' '+
                client.connection.remoteAddress+' '+
                '\n'
            );
        })
    }
    else {
        response.write('pubsub');
    }


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

    response.end();
});

server.listen(port, '0.0.0.0', function() {
    console.log('litening on port '+port);
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


    /**
     * @todo Jāpārbauda origin request.origin
     * ja tas nav mūsu origin tad jātaisa request.reject()
     */


    // setTimeout(() => {
    //     request.reject();
    // }, 2000)
    // return;





    let connection = request.accept(null, request.origin);

    console.log(request.origin);


    let client = clients.add(
        request.resourceURL.query.channel,
        connection,
        {
            socketVersion: connection.webSocketVersion,
            ip: connection.remoteAddress,
            ...request.resourceURL.query
        }
    );

    connection.on('message', function(message) {
        let disconnectDuration = '';
        if (client.disconnectAt) {
            disconnectDuration = 'disc dur '+(new Date()).getTime() - client.disconnectAt;
        }
        console.log('client '+disconnectDuration+' | '+client.data.client+' message', message.utf8Data);

        client.lastMessageAt = timer();

        let data = JSON.parse(message.utf8Data);

        if (data.type == 'ping') {
            /**
             * Ja connections uzrādās, ka disconnected, tad nesūtām pong
             * Ir mirkļi, kad connection uzrādās kā false, bet klienta puse mierīgi
             * iesūta datus un arī saņem pretī pong. Tāpēc šeit, ja ir disconnected,
             * fakit, lai klienta puse slēdzas atkārtoti
             */
            //if (client.connection.connected) {  Patestējam, kā būs ja sūtīs ping arī tam, kas nav connected
                // Atbildam ar pong
                client.connection.sendUTF(JSON.stringify({
                    type: 'pong'
                }));
            //}
        }
        else if (data.type == 'message') {
            Channels.notifyMessage(client.channel, client.data, data.message);
        }
    })

    connection.on('close', function(reasonCode, description) {
        console.log('client ' + client.data.client + ' disconnected.');

        /**
         * Liekam pazīmi, ka disconnected
         * Bet, ja gadījumā tomēr ienāk ziņa no client, tad
         * liekam atpakaļ kā connected
         *
         * Tādu gadījumu, kad client nostrādā close, bet reāli ping
         * nāk iekšā ir bijis
         */
        clients.disconnect(client);

        Channels.notifyStatus(client.channel, client.data, 'disconnect');
    });

    Channels.notifyStatus(client.channel, client.data, 'connect');
})