let timer = require('./timer');
let Redis = require('./Redis');
let StateStore = require('./StateStore');
let formatDate = require('./helpers/formatDate');

let subscribers = []

let monitors = [];

/**
 * Pievieno klientu aktīvajā konekcijām
 */
function connect(channel, connection, data, ip, socketVersion) {

    // Unset channel from client data
    delete data.channel;

    let subscriber = {
        // Unique id within channel
        id: undefined,
        connection: connection,
        channel: channel,
        ip: ip,
        socketVersion: socketVersion,
        // Tas ko klients iesūtījis pieslēdzoties
        data: data,
        disconnectAt: null,
        lastMessageAt: null
    }

    let newLength = subscribers.push(subscriber);

    // Create unique ID, milliseconds plus index in array
    subscribers[newLength-1].id = (new Date().getTime())+'-'+(newLength-1)

    StateStore.addSubscriber(subscribers[newLength-1]);

    /**
     * Trigger listeners
     */
    if (typeof monitors['channel'+subscriber.channel.name] != 'undefined') {
        monitors['channel'+subscriber.channel.name].forEach(id => {
            notifyBySubscriberId(id)
        })
    }

    return subscriber;
}

function disconnect(subscriber) {
    subscriber.disconnectAt = timer();

    StateStore.setSubscriberStatusDisconnected(subscriber);
}

function notifyBySubscriberId(subscriberId) {
    subscribers
        .filter(subscriber => subscriber.id == subscriberId)
        .forEach(subscriber => subscriber.connection.sendUTF(JSON.stringify({'channel_count': 2})))
}

function notify(channelName, message) {
    subscribers
        .filter(subscriber => subscriber.channel == channelName)
        .filter(subscriber => subscriber.connection.connected)
        .forEach(subscriber => {
            subscriber.connection.sendUTF(JSON.stringify(message));
        })
}

function notifyBySubscriber(channelName, subscriberName, message) {
    subscribers
        .filter(subscriber => subscriber.channel.name == channelName)
        .filter(subscriber => subscriber.data.client == subscriberName)
        .filter(subscriber => subscriber.connection.connected)
        .forEach(subscriber => {
            console.log('subscriber.connection.sendUTF');
            subscriber.connection.sendUTF(JSON.stringify(message))
            console.log('SENT subscriber.connection.sendUTF');
        })
}

function findByClient(subscriberName) {
    return subscribers.find(subscriber => subscriber.data.client == subscriberName);
}

/**
 * Novācam tos clients, kuru connections ir bijis neaktīvs
 *
 * Nekatīvs paliek tad, kad disconnect uzstāda disconnectAt laiku
 * un tas laiks ir lielāks par noteiktu threshold
 */
function removeInactive() {
    for (let i = 0; i < subscribers.length; i++) {
        // 3600
        if (subscribers[i].disconnectAt && subscribers[i].disconnectAt.duration() > 40) {

            StateStore.removeSubscriber(subscribers[i]);

            subscribers.splice(i, 1);
            i--;
        }
    }
}

module.exports = {
    connect: connect,
    disconnect: disconnect,
    notify: notify,
    notifyBySubscriber: notifyBySubscriber,
    findByClient: findByClient,
    setSubscriberStatusPong: function(subscriber){
        StateStore.setSubscriberStatusPong(subscriber)
    },
    // Intervāls kādā izvākt inactive
    removeInactiveEverySeconds: function(seconds) {
        setInterval(removeInactive, seconds * 1000)
    },

    addChannelMonitor(subscriber, channels) {
        channels.forEach(channelName => {

            if (typeof monitors['channel'+channelName] == 'undefined') {
                monitors['channel'+channelName] = [];
            }

            monitors['channel'+channelName].push(subscriber.id)
        })

        console.log(monitors);
    }
};
