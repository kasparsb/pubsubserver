let Channels = require('../Channels');
let timer = require('../timer');

/**
 * Apstrādājam ienākošo socket message no client
 *
 * Te ir ping apastrāde
 * Ping tiek apstrādāts automātiski
 *
 * Message tiek nodots uz onMessage callback
 *
 * Ienākošajam message ir jābūt JSON formātā
 * {
 *     type: ping|message,
 *     message: object??,
 * }
 */
function socketOnMessage(client, message) {
    let disconnectDuration = '';
    if (client.disconnectAt) {
        disconnectDuration = 'disc dur '+(new Date()).getTime() - client.disconnectAt;
    }

    client.lastMessageAt = timer();

    let data = null;

    try {
        data = JSON.parse(message.utf8Data);
    }
    catch (e) {
        console.log(e);
    }

    if (data.type == 'ping') {
        //console.log('PING '+client.data?.client+'@'+client.channel);
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
        console.log('MESSAGE '+client.data?.client+'@'+client.channel+' '+data.message);
        Channels.notifySubscriberMessageRecieved(client.channel, client.data, data.message);
    }
}
module.exports = socketOnMessage;



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
