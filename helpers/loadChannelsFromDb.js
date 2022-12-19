let Mysql = require('../Mysql');
let createArray = require('./createArray');

function loadChannelsFromDb(cb) {

    Mysql.getRows('select * from channels', [], function(rows){

        let channels = rows.map(function(row){

            row.listener_notify_endpoints = JSON.parse(row.listener_notify_endpoints);
            row.subscriber_notify = JSON.parse(row.subscriber_notify);

            let channel = {
                id: row.id,
                name: row.name,
                listenerNotifyEndpoints: {
                    subscriberStatusChange: createArray(row.listener_notify_endpoints.subscriberStatusChange),
                    subscriberMessageRecieved: createArray(row.listener_notify_endpoints.subscriberMessageRecieved),
                },
                subscriberNotify: {
                    // If true, then send message to all subscribers about other subscriber Status Change
                    subscriberStatusChange: false,
                    // Notify all subscribers when message recieved from subscriber
                    subscriberMessageRecieved: false
                }
            }

            if (typeof row.subscriber_notify?.subscriberStatusChange != 'undefined') {
                channel.subscriberNotify.subscriberStatusChange = row.subscriber_notify.subscriberStatusChange;
            }
            if (typeof row.subscriber_notify?.subscriberMessageRecieved != 'undefined') {
                channel.subscriberNotify.subscriberMessageRecieved = row.subscriber_notify.subscriberMessageRecieved;
            }

            return channel;
        })

        cb(channels)
    });
}

module.exports = loadChannelsFromDb