let Mysql = require('./Mysql');
let axios = require('axios');

let channels = [];

/**
 * Helper, makes http request with data
 * Posts data to provided url
 * Failed request is attempted one more time
 */
function send(url, data, tries) {
    if (typeof tries == 'undefined') {
        tries = 0;
    }

    if (tries++ > 2) {
        return;
    }

    //console.log('notify url '+url);
    //console.log(data);
    axios.post(url, data)
        .catch(err => {
            setTimeout(() => send(url, data, tries+1), 500)
        })
}

/**
 * Calls cb for every channel url
 */
function forEachUrl(channelId, urlName, cb) {
    let channel = channels.find(channel => channel.id == channelId)
    if (channel) {
        channel.notifyEndpoints[urlName].forEach(url => cb(url))
    }
}

function loadFromDb(done) {
    Mysql.getRows('select * from channels', [], function(rows){

        rows.forEach(function(row){

            row.notify_endpoints = JSON.parse(row.notify_endpoints);

            if (typeof row.notify_endpoints.subscriberStatusChange == 'string') {
                row.notify_endpoints.subscriberStatusChange = [
                    row.notify_endpoints.subscriberStatusChange
                ]
            }

            if (typeof row.notify_endpoints.subscriberMessageRecieved == 'string') {
                row.notify_endpoints.subscriberMessageRecieved = [
                    row.notify_endpoints.subscriberMessageRecieved
                ]
            }

            channels.push({
                dbid: row.id,
                id: row.name,
                notifyEndpoints: row.notify_endpoints
            })
        })

        done()
    });
}

/**
 * Send message to channel listener
 */
function notifyListener(channelId, urlName, data) {
    console.log('notify channel listener: '+channelId+' '+urlName);
    forEachUrl(channelId, urlName, url => {
        send(url, data)
    })
}

module.exports = {
    loadFromDb: loadFromDb,
    /**
     * Notify channel listener about message from subscriber
     */
    notifySubscriberMessageRecieved(channel, subscriberData, message) {
        notifyListener(channel, 'subscriberMessageRecieved', {
            message: message,
            subscriber: subscriberData
        });
    },
    notifySubscriberStatusChange(channel, subscriberData, status) {
        notifyListener(channel, 'subscriberStatusChange', {
            status: status,
            subscriber: subscriberData
        });
    },
    getChannels: function(){
        return channels;
    }
}
