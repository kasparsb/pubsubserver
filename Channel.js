let Client = require('./Client');
let arrayUnique = require('./helpers/arrayUnique');
const Mysql = require('./Mysql');

function formatChannelFromDbRow(dbRow) {
    let r = {
        id: dbRow.id,
        name: dbRow.name
    }

    let listenerEndpoints = JSON.parse(dbRow.listener_endpoints);

    if (!listenerEndpoints) {
        listenerEndpoints = {};
    }

    // Client status change. Kad mainās statuss, tad izsauks šos endpoints
    if (!listenerEndpoints.client_status_change) {
        // new Set(), jo čakarīgi konverēt uz json
        listenerEndpoints.client_status_change = [];
    }
    /**
     * TODO te vēl var pielikt citus listeners
     */


    r.listener_endpoints = listenerEndpoints;

    return r;
}

function dbUpdate(channelId, data, cb) {
    Mysql.update(
        'channels',
        data,
        {
            id: channelId
        },
        cb
    )
}

function Channel(dbRow) {

    this.data = formatChannelFromDbRow(dbRow);

    this.clients = new Map();
    // Katrs topic ir set of client ids
    this.topics = new Map();

    this.listenerEndpoint = this.data.listener_endpoints;
}

Channel.prototype = {
    connectClient(connection, data, deviceInfo) {

        let newClient = new Client(connection, data, deviceInfo);
        newClient.connect();

        this.clients.set(newClient.id, newClient);

        return newClient;
    },
    getClient(clientId) {
        return this.clients.get(clientId);
    },
    /**
     * Sūta message visiem kanāla clients
     */
    sendMessage(message) {
        this.clients.forEach(client => client.sendMessage(message));
    },
    sendMessageToTopic(topic, message) {
        if (!this.topics.has(topic)) {
            return;
        }

        // Visiem topic klientiem nosūtām message
        this.topics.get(topic)
            .forEach(clientId => this.sendMessageToClient(clientId, message))
    },
    sendMessageToClient(clientId, message) {
        let client = this.clients.get(clientId);
        if (client) {
            client.sendMessage(message)
        }
    },
    subscribeClientToTopics(client, topics) {
        // Izvācam client no visiem topics, kuros tas ir tagad pierakstīts
        client.topics.forEach(topic => this.removeClientFromTopic(topic, client))

        // Uzliekam client topics referenci
        client.topics = topics;

        // Pierakstām topicos
        topics.forEach(topic => this.addClientToTopic(topic, client))

        // Notīrām tukšos topics
        this.topics.forEach((clients, topic) => {
            if (!clients.size) {

                this.topics.delete(topic);
            }
        })
    },
    addClientToTopic(topic, client) {
        let topicClients = this.topics.has(topic) ? this.topics.get(topic) : new Set();
        topicClients.add(client.id);
        this.topics.set(topic, topicClients)
    },
    removeClientFromTopic(topic, client) {
        if (!this.topics.has(topic)) {
            return;
        }

        let topicClients = this.topics.get(topic);
        topicClients.delete(client.id);
        this.topics.set(topic, topicClients);
    },

    getClientStatusChangeListenerEndpoints() {
        return this.listenerEndpoint.client_status_change;
    },

    appendClientStatusChangeListenerEndpoint(endpoint, cb) {

        this.listenerEndpoint.client_status_change.push(endpoint);
        this.listenerEndpoint.client_status_change = arrayUnique(this.listenerEndpoint.client_status_change);

        // Saglabājam datubāzē
        dbUpdate(this.data.id, {
            listener_endpoints: JSON.stringify(this.listenerEndpoint)
        }, cb)
    },

    removeClientStatusChangeListenerEndpoint(endpoint, cb) {
        let i = this.listenerEndpoint.client_status_change.indexOf(endpoint);
        if (i >= 0) {
            this.listenerEndpoint.client_status_change.splice(i, 1);
        }

        // Saglabājam datubāzē
        dbUpdate(this.data.id, {
            listener_endpoints: JSON.stringify(this.listenerEndpoint)
        }, cb)
    }
}

module.exports = Channel;