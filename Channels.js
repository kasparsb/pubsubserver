let axios = require('axios');
let Mysql = require('./Mysql');
let Channel = require('./Channel');
let ClientsList = require('./ClientsList')

let channels = [];

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
        .catch(err => {
            setTimeout(() => send(url, message, tries+1), 500)
        })
}

function loadFromDb(done) {

    Mysql.getRows('select * from channels', [], function(rows){

        channels = rows.map(row => new Channel(row))

        done();
    });
}

function findByName(channelName) {
    return channels.find(channel => channel.name == channelName);
}

function connectClient(channelName, connection, data, deviceInfo) {
    let channel = findByName(channelName);

    if (!channel) {
        console.log('Channel not found '+request.resourceURL.query.channel);
        return null;
    }

    return channel.connectClient(connection, data, deviceInfo );
}









/**
 * Send message to channel listener
 */
function notifyListeners(channelName, eventName, message) {
    let channel = findChannel(channelName);

    if (!channel) {
        return;
    }

    // Trigger listener url endpoints
    channel.listenerNotifyEndpoints[eventName].forEach(url => {
        send(url, message)
    })

    // Notify Channel subscribers
    if (channel.subscriberNotify[eventName]) {
        /**
         * @todo Vēl, vai vajag kaut kā izlaist to, kurš sūta ziņojumu
         * lai pats nesaņem ziņu par sevi
         */
        ClientsList.notify(channel.name, message);
    }
}

module.exports = {
    findByName: findByName,
    loadFromDb: loadFromDb,

    connectClient: connectClient,






    /**
     * Notify channel listener about message from subscriber
     */
    notifySubscriberMessageRecieved(channel, messageMessage) {
        notifyListeners(channel.name, 'subscriberMessageRecieved', messageMessage);
    },
    notifySubscriberStatusChange(channel, messageStatus) {
        notifyListeners(channel.name, 'subscriberStatusChange', messageStatus);
    },
    getChannels: function(){
        return channels;
    }
}
