let Channels = require('../Channels');
let ClientsList = require('../ClientsList');
let Listeners = require('../Listeners');
let timer = require('../timer');

let messagePong = require('../message/pong');
let messageMessage = require('../message/message');

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
function socketOnMessage(subscriber, message) {
    subscriber.lastMessageAt = timer();

    let data = null;

    try {
        data = JSON.parse(message.utf8Data);
    }
    catch (e) {
        console.log(e);
    }

    if (data.type == 'ping') {
        /**
         * Ja connections uzrādās, ka disconnected, tad nesūtām pong
         * Ir mirkļi, kad connection uzrādās kā false, bet klienta puse mierīgi
         * iesūta datus un arī saņem pretī pong. Tāpēc šeit, ja ir disconnected,
         * fakit, lai klienta puse slēdzas atkārtoti
         */
        //if (client.connection.connected) {  Patestējam, kā būs ja sūtīs ping arī tam, kas nav connected
            // Atbildam ar pong
            subscriber.connection.sendUTF(JSON.stringify(messagePong()));
            ClientsList.setSubscriberStatusPong(subscriber);
        //}


    }
    /**
     * Special case, admin channel users can listen on channel|subscriber changes
     */
    else if (data.type == 'listen') {
        Listeners.add(subscriber, data.eventName, data.subjects);
    }
    else if (data.type == 'message') {
        Channels.notifySubscriberMessageRecieved(
            // Channel name
            client.channel,
            messageMessage(data.message, undefined, client)
        );
    }
}
module.exports = socketOnMessage;