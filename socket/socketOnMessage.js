let Channels = require('../Channels');
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
function socketOnMessage(client, message) {
    client.lastMessageAt = timer();

    let data = null;

    try {
        data = JSON.parse(message.utf8Data);
    }
    catch (e) {
        console.log(e);
    }

    switch (data.type) {
        case 'ping':
            /**
             * Ja connections uzrādās, ka disconnected, tad nesūtām pong
             * Ir mirkļi, kad connection uzrādās kā false, bet klienta puse mierīgi
             * iesūta datus un arī saņem pretī pong. Tāpēc šeit, ja ir disconnected,
             * fakit, lai klienta puse slēdzas atkārtoti
             */
            //if (client.connection.connected) {  Patestējam, kā būs ja sūtīs ping arī tam, kas nav connected

            client.sendMessage(messagePong());
            client.touchPongAt();

            break;

        case 'subscribe-to-topics':

            if (typeof data.topics != 'undefined') {
                Channels.subscribeClientToTopics(client, data.topics);
            }

            break;
    }




    // /**
    //  * Special case, admin channel subscribers
    //  * they can watch changes in
    //  *      channelChange
    //  *      subscriberChange
    //  * @eventName channelChange|subscriberChange
    //  * @subjects channel name or subscriber id
    //  */
    // else if (data.type == 'watch') {
    //     Listeners.add(subscriber, data.eventName, data.subjects);
    // }
    // else if (data.type == 'unwatch') {
    //     Listeners.remove(subscriber, data.eventName, data.subjects);
    // }
    // else if (data.type == 'unwatchall') {
    //     Listeners.remove(subscriber);
    // }
    // else if (data.type == 'message') {
    //     Channels.notifySubscriberMessageRecieved(
    //         // Channel name
    //         client.channel,
    //         messageMessage(data.message, undefined, client)
    //     );
    // }
}
module.exports = socketOnMessage;