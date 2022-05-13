let timer = require('./timer');

function ClientsList() {
    this.clients = []
}

ClientsList.prototype = {
    add(channel, connection, data) {
        let client = {
            connection: connection,
            channel: channel,
            data: data,
            disconnectAt: null,
            lastMessageAt: null
        }

        this.clients.push(client);

        return client;
    },

    findByClient(id) {
        return this.clients.find(client => client.data.client == id);
    },

    disconnect(client) {
        client.disconnectAt = timer();
    },

    notify(channel, message, payload) {
        if (typeof payload == 'undefined') {
            payload = null;
        }
        this.clients
            .filter(subscriber => subscriber.channel == channel)
            .filter(subscriber => subscriber.connection.connected)
            .forEach(subscriber => {
                subscriber.connection.sendUTF(JSON.stringify({
                    type: 'message',
                    message: message,
                    payload: typeof payload == 'undefined' ? null : payload
                }));
            })
    },

    notifyByClient(channel, client, message, payload) {
        this.clients
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
    },

    /**
     * Novācam tos clients, kuru connections ir bijis neaktīvs
     */
    removeInactive() {
        console.log('remove inactive');
        for (let i = 0; i < this.clients.length; i++) {
            // 3600
            if (this.clients[i].disconnectAt && this.clients[i].disconnectAt.duration() > 40) {
                this.clients.splice(i, 1);
                console.log('remove inactive '+i);
                i--;
            }
        }
    }
}

module.exports = ClientsList;