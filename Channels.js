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

function createOrUpdate(data, cb) {
    if (data.id) {
        Mysql.update(
            'channels',
            data,
            {
                id: data.id
            },
            cb
        )
    }
    else {
        Mysql.insert(
            'channels',
            data,
            cb
        )
    }
}

function deleteChannel(channelId, cb) {
    Mysql.delete(
        'channels',
        {
            id: channelId
        },
        cb
    )
}

function loadFromDb(done) {

    Mysql.getRows('select * from channels', [], function(rows){

        channels = rows.map(row => new Channel(row))

        done(rows);
    });
}

function find(channelId) {
    return channels.find(channel => channel.id == channelId);
}

function findByName(channelName) {
    return channels.find(channel => channel.name == channelName);
}

function connectClient(channelName, connection, data, deviceInfo) {
    let channel = findByName(channelName);

    if (channel) {
        return channel.connectClient(connection, data, deviceInfo );
    }
}

function sendMessage(channelName, message) {
    let channel = findByName(channelName);

    if (channel) {
        channel.sendMessage(message)
    }
}

function sendMessageToClient(channelName, clientId, message) {
    let channel = findByName(channelName);

    if (channel) {
        channel.sendMessageToClient(clientId, message)
    }
}

function sendMessageToTopic(channelName, clientId, message) {
    let channel = findByName(channelName);

    if (channel) {
        channel.sendMessageToTopic(clientId, message)
    }
}

function getClient(channelName, clientId) {
    let channel = findByName(channelName);
    if (!channel) {
        return null;
    }

    return channel.getClient(clientId);
}

function subscribeClientToTopics(client, topics) {
    let channel = findByName(client.channel);
    if (channel) {
        channel.subscribeClientToTopics(client, topics)
    }
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
    find: find,
    findByName: findByName,
    loadFromDb: loadFromDb,
    createOrUpdate: createOrUpdate,
    delete: deleteChannel,

    connectClient: connectClient,
    getClient: getClient,
    sendMessage: sendMessage,
    sendMessageToClient: sendMessageToClient,
    sendMessageToTopic: sendMessageToTopic,
    subscribeClientToTopics: subscribeClientToTopics,






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
