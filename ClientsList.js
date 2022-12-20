let timer = require('./timer');

let clients = []

function add(channel, connection, data, ip, socketVersion) {

    // Unset channel from client data
    delete data.channel;

    let client = {
        connection: connection,
        channel: channel,
        ip: ip,
        socketVersion: socketVersion,
        // Tas ko klients iesūtījis pieslēdzoties
        data: data,
        disconnectAt: null,
        lastMessageAt: null
    }

    clients.push(client);

    return client;
}

function findByClient(subscriberName) {
    return clients.find(client => client.data.client == subscriberName);
}

function disconnect(client) {
    client.disconnectAt = timer();
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
        .filter(subscriber => subscriber.channel == channelName)
        .filter(subscriber => subscriber.data.client == subscriberName)
        .filter(subscriber => subscriber.connection.connected)
        .forEach(subscriber => {
            subscriber.connection.sendUTF(JSON.stringify(message))
        })
}

/**
 * Novācam tos clients, kuru connections ir bijis neaktīvs
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
    add: add,
    notify: notify,
    notifyBySubscriber: notifyBySubscriber,
    disconnect: disconnect,
    findByClient: findByClient,
    // Intervāls kādā izvākt inactive
    removeInactiveEverySeconds: function(seconds) {
        setInterval(removeInactive, seconds * 1000)
    }
};
