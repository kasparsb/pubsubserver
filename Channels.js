let axios = require('axios');
let ClientsList = require('./ClientsList')

let loadChannelsFromDb = require('./helpers/loadChannelsFromDb');

let channelStructure = {
    name: '',

    // Ping external url on these events
    listenerNotifyEndpoints: {
        subscriberStatusChange: [],
        subscriberMessageRecieved: []
    },

    subscriberNotify: {
        // If true, then send message to all subscribers about other subscriber Status Change
        subscriberStatusChange: false,
        // Notify all subscribers when message recieved from subscriber
        subscriberMessageRecieved: false
    }
}


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

    console.log(message);

    axios.post(url, message)
        .catch(err => {
            setTimeout(() => send(url, message, tries+1), 500)
        })
}

function loadFromDb(done) {
    loadChannelsFromDb(function(data){

        channels = data;

        done();
    })
}

/**
 * Send message to channel listener
 */
function notifyListeners(channelName, eventName, message) {
    console.log('notify channel listeners: '+channelName+' '+eventName);

    let channel = channels.find(channel => channel.name == channelName);

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
    loadFromDb: loadFromDb,
    /**
     * Notify channel listener about message from subscriber
     */
    notifySubscriberMessageRecieved(channelName, messageMessage) {
        notifyListeners(channelName, 'subscriberMessageRecieved', messageMessage);
    },
    notifySubscriberStatusChange(channelName, messageStatus) {
        notifyListeners(channelName, 'subscriberStatusChange', messageStatus);
    },
    getChannels: function(){
        return channels;
    }
}
