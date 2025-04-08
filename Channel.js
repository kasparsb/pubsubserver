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

        this.clients.set(newClient.id, newClient);

        return newClient;
    }
}

module.exports = Channel;