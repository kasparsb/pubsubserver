let timer = require('./timer');

let clients = []

function add(channel, connection, data) {
    let client = {
        connection: connection,
        channel: channel,
        data: data,
        disconnectAt: null,
        lastMessageAt: null
    }

    clients.push(client);

    return client;
}

function findByClient(id) {
    return clients.find(client => client.data.client == id);
}

function disconnect(client) {
    client.disconnectAt = timer();
}

function notify(channel, message, payload) {
    if (typeof payload == 'undefined') {
        payload = null;
    }
    clients
        .filter(subscriber => subscriber.channel == channel)
        .filter(subscriber => subscriber.connection.connected)
        .forEach(subscriber => {
            subscriber.connection.sendUTF(JSON.stringify({
                type: 'message',
                message: message,
                payload: typeof payload == 'undefined' ? null : payload
            }));
        })
}

function notifyByClient(channel, client, message, payload) {
    clients
        .filter(subscriber => subscriber.channel == channel)
        .filter(subscriber => subscriber.data.client == client)
        .filter(subscriber => subscriber.connection.connected)
        .forEach(subscriber => {
            subscriber.connection.sendUTF(JSON.stringify({
                type: 'message',
                message: message,
                payload: payload
            }))
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
    notifyByClient: notifyByClient,
    disconnect: disconnect,
    findByClient: findByClient,
    // Intervāls kādā izvākt inactive
    removeInactiveEverySeconds: function(seconds) {
        setInterval(removeInactive, seconds * 1000)
    }
};