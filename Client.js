let timer = require('./timer');
let formatDate = require('./helpers/formatDate');

function Client(connection, data, deviceInfo) {

    this.connection = connection;

    this.id = undefined;

    /**
     * Tas ko klients iesūtījis pieslēdzoties
     */
    this.data = data;

    /**
     * ip, socketVersion, userAgent
     */
    this.deviceInfo = deviceInfo;


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
    dump() {
        return {
            data: this.data,
            createdAt: this.createdAt,
            connectedAt: this.connectedAt,
            pongAt: this.pongAt
        }
    }
}

module.exports = Client;