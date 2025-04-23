let Mysql = require('./Mysql');
let Channel = require('./Channel');

let channels = [];

function createOrUpdate(data, cb) {

    /**
     * TODO listener_endpoints apstrādi vajag pārlikt vienu viet
     * laikam jāpārtaisa, lai update un insert veic Channel nevis Channels
     */

    // Filter
    if (typeof data.listener_endpoints == 'undefined') {
        data.listener_endpoints = {};
    }
    if (typeof data.listener_endpoints.client_status_change == 'undefined') {
        data.listener_endpoints.client_status_change = [];
    }

    data.listener_endpoints.client_status_change = data.listener_endpoints.client_status_change.filter(value => value ? true : false);

    if (typeof data.listener_endpoints != 'undefined') {
        data.listener_endpoints = JSON.stringify(data.listener_endpoints);
    }

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
    return channels.find(channel => channel.data.id == channelId);
}

function findByName(channelName) {
    return channels.find(channel => channel.data.name == channelName);
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

    // Intervāls kādā izvākt inactive
    removeInactiveEverySeconds(seconds) {
        setInterval(() => {
            channels.forEach(channel => channel.removeInactive())
        }, seconds * 1000)
    },

    getChannels: function(){
        return channels;
    }
}
