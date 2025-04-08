let Client = require('./Client');

function Channel(dbRow) {

    this.id = dbRow.id;
    this.name = dbRow.name;

    this.data = dbRow;

    this.clients = new Map();
}

Channel.prototype = {
    connectClient(connection, data, deviceInfo) {

        let newClient = new Client(connection, data, deviceInfo);
        newClient.connect();

        this.clients.set(newClient.id, newClient);

        return newClient;
    },
    /**
     * Sūta message visiem kanāla clients
     */
    sendMessage(message) {
        this.clients.forEach(client => client.sendMessage(message));
    },
    sendMessageToClient(clientId, message) {
        let client = this.clients.get(clientId);
        if (client) {
            client.sendMessage(message)
        }
    }
}

module.exports = Channel;