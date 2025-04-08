let Client = require('./Client');

function Channel(dbRow) {

    this.id = dbRow.id;
    this.name = dbRow.name;

    this.data = dbRow;

    this.clients = new Map();
    // Katrs topic ir set of client ids
    this.topics = new Map();
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
    }
}

module.exports = Channel;