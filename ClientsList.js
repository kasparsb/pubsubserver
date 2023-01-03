let timer = require('./timer');
let Redis = require('./Redis');
let formatDate = require('./helpers/formatDate');

let subscribers = []

function cleanUpClientsInChannels(channels) {
    let transation = Redis.client().multi();
    channels.forEach(channel => transation.DEL('channel'+channel.id));
    transation.exec();
}

function setSubscriberDataInHash(subscriberId, data) {
    let transaction = Redis.client().multi();
    for (let field in data) {
        transaction.HSET('client'+subscriberId, field, data[field]);
    }
    transaction.EXPIRE('client'+subscriberId, 60*5);
    transaction.exec();
}

function addSubscriberToRedis(subscriber) {
    // Channel set, te būs visu subscribers id
    Redis.client().SADD('channel'+subscriber.channel.id, subscriber.id);

    // SET, te glabājam subscriber datus
    setSubscriberDataInHash(subscriber.id, {
        channel_id: subscriber.channel.id,
        subscriber_id: subscriber.data.client,
        ip: subscriber.ip,
        created_at: formatDate.ymdhis(new Date()),
        status: 'connected',
        connected_at: formatDate.ymdhis(new Date()),
        disconnected_at: ''
    })
}
function removeSubscriberFromRedis(subscriber) {
    // Izmetam no channel SET
    Redis.client().multi()
        .DEL('client'+subscriber.id)
        .SREM('channel'+subscriber.channel.id, subscriber.id)
        .exec();
}
function setSubscriberStatusConnected(subscriber) {
    setSubscriberDataInHash(subscriber.id, {
        status: 'connected',
        connected_at: formatDate.ymdhis(new Date()),
        disconnected_at: ''
    })
}
function setSubscriberStatusDisconnected(subscriber) {
    setSubscriberDataInHash(subscriber.id, {
        status: 'disconnected',
        disconnected_at: formatDate.ymdhis(new Date()),
    })
}
function setSubscriberStatusPong(subscriber) {
    setSubscriberDataInHash(subscriber.id, {
        pong_at: formatDate.ymdhis(new Date())
    })
}

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




    /**
     *
     *
     * @todo Push only one client to channel List in Redis
     *
     *
     */
    addSubscriberToRedis(subscribers[newLength-1]);


    return subscriber;
}

function disconnect(subscriber) {
    subscriber.disconnectAt = timer();

    setSubscriberStatusDisconnected(subscriber);
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

            removeSubscriberFromRedis(subscribers[i]);

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
    setSubscriberStatusPong: setSubscriberStatusPong,
    cleanUpClientsInChannels: cleanUpClientsInChannels,
    // Intervāls kādā izvākt inactive
    removeInactiveEverySeconds: function(seconds) {
        setInterval(removeInactive, seconds * 1000)
    }
};
