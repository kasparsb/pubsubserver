let timer = require('./timer');
let Mysql = require('./Mysql');

let clients = []

function setSubscriberStatusConnected(subscriber) {
    if (!subscriber.channelSubscriberStatusId) {
        return
    }

    Mysql.update(
        'channel_subscriber_statuses',
        {
            connected_at: Mysql.now()
        },
        {
            id: subscriber.channelSubscriberStatusId
        }
    )
}

function setSubscriberStatusDisconnected(subscriber) {
    if (!subscriber.channelSubscriberStatusId) {
        return
    }

    Mysql.update(
        'channel_subscriber_statuses',
        {
            disconnected_at: Mysql.now()
        },
        {
            id: subscriber.channelSubscriberStatusId
        }
    )
}

/**
 * Izveidojam subscriber status DB ierakstu
 * Tādā veidā vienmēr varēs update tieši ierakstu
 * un nevajadzēs meklēt datubāzē pēc subscriber id
 * (subscriber id var būt arī tukšs)
 */
function createSubscriberStatus(subscriber, cb) {
    Mysql.insert('channel_subscriber_statuses', {

        channel_id: subscriber.channel.id,
        subscriber_id: subscriber.data.client,
        ip: subscriber.ip,
        created_at: Mysql.now()

    }, function(insertId){
        cb(insertId)
    })
}

/**
 * Pievieno klientu aktīvajā konekcijām
 */
function connect(channel, connection, data, ip, socketVersion) {

    // Unset channel from client data
    delete data.channel;

    let subscriber = {
        /**
         * ID no tabulas channel_subscriber_statuses
         */
        channelSubscriberStatusId: undefined,
        connection: connection,
        channel: channel,
        ip: ip,
        socketVersion: socketVersion,
        // Tas ko klients iesūtījis pieslēdzoties
        data: data,
        disconnectAt: null,
        lastMessageAt: null
    }

    let newLength = clients.push(subscriber);

    createSubscriberStatus(subscriber, function(id){
        clients[newLength-1].channelSubscriberStatusId = id;

        setSubscriberStatusConnected(clients[newLength-1]);
    })

    return subscriber;
}

function disconnect(subscriber) {
    subscriber.disconnectAt = timer();

    setSubscriberStatusDisconnected(subscriber);
}

function notify(channelName, message) {
    clients
        .filter(subscriber => subscriber.channel == channelName)
        .filter(subscriber => subscriber.connection.connected)
        .forEach(subscriber => {
            subscriber.connection.sendUTF(JSON.stringify(message));
        })
}

function notifyBySubscriber(channelName, subscriberName, message) {
    clients
        .filter(subscriber => subscriber.channel.name == channelName)
        .filter(subscriber => subscriber.data.client == subscriberName)
        .filter(subscriber => subscriber.connection.connected)
        .forEach(subscriber => {
            subscriber.connection.sendUTF(JSON.stringify(message))
        })
}

function findByClient(subscriberName) {
    return clients.find(client => client.data.client == subscriberName);
}

/**
 * Novācam tos clients, kuru connections ir bijis neaktīvs
 *
 * Nekatīvs paliek tad, kad disconnect uzstāda disconnectAt laiku
 * un tas laiks ir lielāks par noteiktu threshold
 */
function removeInactive() {
    for (let i = 0; i < clients.length; i++) {
        // 3600
        if (clients[i].disconnectAt && clients[i].disconnectAt.duration() > 40) {
            clients.splice(i, 1);
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
    // Intervāls kādā izvākt inactive
    removeInactiveEverySeconds: function(seconds) {
        setInterval(removeInactive, seconds * 1000)
    }
};
