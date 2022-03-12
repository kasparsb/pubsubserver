let axios = require('axios');

let channels = [];

function send(url, data, tries) {
    if (typeof tries == 'undefined') {
        tries = 0;
    }

    if (tries++ > 2) {
        return;
    }

    axios.post(url, data)
        .catch(err => {
            setTimeout(() => send(url, data, tries+1), 500)
        })
}

function forEachUrl(id, urlName, cb) {
    let channel = channels.find(channel => channel.id == id)
    if (channel) {
        channel[urlName].forEach(url => cb(url))
    }
}

function notify(channelId, urlName, data) {
    forEachUrl(channelId, urlName, url => {
        send(url, data)
    })
}

module.exports = {
    setChannels(data) {
        channels = data;
    },
    notifyMessage(channel, subscriberData, message) {
        notify(channel, 'subscriberMessageUrl', {
            message: message,
            subscriber: subscriberData
        });
    },
    notifyStatus(channel, subscriberData, status) {
        notify(channel, 'subscriberStatusUrl', {
            status: status,
            subscriber: subscriberData
        });
    }
}