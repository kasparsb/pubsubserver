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

function notify(channelId, urlName, data) {
    console.log('notify channel: '+channelId+' '+urlName);
    forEachUrl(channelId, urlName, url => {
        send(url, data)
    })
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

module.exports = {
    loadFromDb: loadFromDb,
    notifyMessage(channel, subscriberData, message) {
        notify(channel, 'subscriberMessageRecieved', {
            message: message,
            subscriber: subscriberData
        });
    },
    notifyStatus(channel, subscriberData, status) {
        notify(channel, 'subscriberStatusChange', {
            status: status,
            subscriber: subscriberData
        });
    },
    getChannels: function(){
        return channels;
    }
}