let timer = require('./timer');
let StateStore = require('./StateStore');
let Listeners = require('./Listeners');
let formatDate = require('./helpers/formatDate');

let subscribers = []


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
        lastMessageAt: null,

        created_at: formatDate.ymdhis(new Date()),
        connected_at: formatDate.ymdhis(new Date()),
        disconnected_at: '',
        pong_at: '',

        status: 'connected',

        /**
         * Admin eventi uz kuriem parakstīts subscriber
         * Kad subscriber disconnect, tad noņemts no Listeners
         */
        listeningOn: []
    }

    let newLength = subscribers.push(subscriber);

    // Create unique ID, milliseconds plus index in array
    subscribers[newLength-1].id = (new Date().getTime())+'-'+(newLength-1)

    StateStore.addSubscriber(subscribers[newLength-1]);

    let sc = channelSubscribersCount(channel);
    StateStore.setChannelSubscribersCount(channel, sc);
    Listeners.triggerChannelChange(channel, {
        subscribers_count: sc
    })
    Listeners.triggerSubscriberChange(subscribers[newLength-1])

    return subscriber;
}

function disconnect(subscriber) {
    subscriber.disconnectAt = timer();
    subscriber.status = 'disconnected';
    subscriber.disconnected_at = formatDate.ymdhis(new Date());

    StateStore.updateSubscriberData(subscriber)

    Listeners.remove(subscriber);

    let sc = channelSubscribersCount(subscriber.channel);
    StateStore.setChannelSubscribersCount(subscriber.channel, sc);
    // Channel change
    Listeners.triggerChannelChange(subscriber.channel, {
        subscribers_count: sc
    })
    Listeners.triggerSubscriberChange(subscriber)
}

function notifyChannel(channelName, message) {
    subscribers
        .filter(subscriber => subscriber.channel.name == channelName)
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

function channelSubscribersCount(channel) {
    let r = 0;
    for (let i = 0; i < subscribers.length; i++) {
        if (subscribers[i].channel.id == channel.id) {
            if (!subscribers[i].disconnectAt) {
                r++;
            }
        }
    }
    return r;
}

module.exports = {
    connect: connect,
    disconnect: disconnect,
    notifyChannel: notifyChannel,
    notifyBySubscriber: notifyBySubscriber,
    findByClient: findByClient,
    setSubscriberStatusPong: function(subscriber){

        subscriber.pong_at = formatDate.ymdhis(new Date());

        StateStore.updateSubscriberData(subscriber)

        /**
         * TODO šeit tiešām uz katru pingo/pong vajag notify
         */
        Listeners.triggerSubscriberChange(subscriber)
    },
    // Intervāls kādā izvākt inactive
    removeInactiveEverySeconds: function(seconds) {
        setInterval(removeInactive, seconds * 1000)
    }
};
