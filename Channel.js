let axios = require('axios');
let Client = require('./Client');
let arrayUnique = require('./helpers/arrayUnique');
let messageStatus = require('./message/status');
let timer = require('./timer');
let formatDate = require('./helpers/formatDate');
let Mysql = require('./Mysql');

/**
 * Helper, makes http request with data
 * Posts data to provided url
 * Failed request is attempted one more time
 */
function send(url, message, tries) {
    if (typeof tries == 'undefined') {
        tries = 0;
    }

    if (tries++ > 2) {
        return;
    }

    axios.post(url, message)
        .then(r => {
            console.log(r.data);
        })
        .catch(err => {
            console.log('    cant send', err);
            setTimeout(() => send(url, message, tries+1), 500)
        })
}

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

        this.notifyListeners('client_status_change', 'connect', newClient);

        return newClient;
    },
    disconnectClient(client) {
        /**
         * Liekam pazīmi, ka disconnected
         * Bet, ja gadījumā tomēr ienāk ziņa no client, tad
         * liekam atpakaļ kā connected
         *
         * Tādu gadījumu, kad client nostrādā close, bet reāli ping
         * nāk iekšā ir bijis
         */
        client.disconnectAt = timer();
        client.status = 'disconnected';
        client.disconnected_at = formatDate.ymdhis(new Date());

        this.notifyListeners('client_status_change', 'disconnect', client);
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

    removeInactive() {
        let clientsToRemove = [];
        this.clients.forEach((client, clientId) => {
            if (subscribers[i].disconnectAt && subscribers[i].disconnectAt.duration() > 40) {
                clientsToRemove.push(clientId);
            }
        })

        if (clientsToRemove.length) {
            console.log('Remove inactive, channel '+this.data.name+', clients '+clientsToRemove.length);

            clientsToRemove.forEach(clientId => this.clients.delete(clientId))
        }
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
    },

    notifyListeners(listenersGroupName, clientStatus, client) {
        this.listenerEndpoint[listenersGroupName]
            .forEach(endpoint => {
                send(endpoint, messageStatus(clientStatus, client))
            })
    }
}

module.exports = Channel;