let timer = require('./timer');
let formatDate = require('./helpers/formatDate');

function Client(connection, data, deviceInfo) {

    this.connection = connection;

    /**
     * Tas ko klients iesūtījis pieslēdzoties
     */
    this.data = data;

    /**
     * ip, socketVersion, userAgent
     */
    this.deviceInfo = deviceInfo;


    /**
     * Id ņemam no data.client
     * applikācija, kura izmanto pubsub nodrošinās, ka
     * katram klientam ir savs unikāls id
     */
    this.id = this.data.client;

    /**
     * Klienta id un channel name
     */
    this.connectionName = this.id+'@'+this.data.channel;

    this.createdAt = formatDate.ymdhis(new Date());

    this.disconnectAt = null;
    this.lastMessageAt = null;
    this.connectedAt = null;
    this.disconnectedAt = null;
    this.pongAt = null;

    this.status = null;
}

Client.prototype = {
    connect() {
        this.connectedAt = formatDate.ymdhis(new Date());
        this.disconnectedAt = null;
        this.pongAt = null;

        this.status = 'connected';
    },
    disconnect() {
        this.disconnectAt = timer();
        this.status = 'disconnected';
        this.disconnectedAt = formatDate.ymdhis(new Date());
    },
    /**
     * Send message to client connection
     * @param message Object
     *
     * message tiks konvertēts uz json string
     */
    sendMessage(message) {
        this.connection.sendUTF(JSON.stringify(message));
    },
    touchPongAt() {
        this.pongAt = formatDate.ymdhis(new Date());
    },
    dump() {
        return {
            connectionName: this.connectionName,
            createdAt: this.createdAt,
            connectedAt: this.connectedAt,
            pongAt: this.pongAt
        }
    }
}

module.exports = Client;