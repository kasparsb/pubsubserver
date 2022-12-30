let Mysql = require('../Mysql');
let createArray = require('./createArray');
let createBoolean = require('./createBoolean');

function loadChannelsFromDb(cb) {
    Mysql.getRows('select * from channels', [], function(rows){

        let channels = rows.map(function(row){

            /**
             * @todo Kāpēc uz prod servera šeit nāk atpakaļ jau JSON
             * bet uz dev servera string
             */
            if (typeof row.listener_notify_endpoints == 'string') {
                row.listener_notify_endpoints = JSON.parse(row.listener_notify_endpoints);
            }
            if (typeof row.subscriber_notify == 'string') {
                row.subscriber_notify = JSON.parse(row.subscriber_notify);
            }

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

            if (typeof row.subscriber_notify.subscriberStatusChange != 'undefined') {
                channel.subscriberNotify.subscriberStatusChange = row.subscriber_notify.subscriberStatusChange;
            }
            if (typeof row.subscriber_notify.subscriberMessageRecieved != 'undefined') {
                channel.subscriberNotify.subscriberMessageRecieved = row.subscriber_notify.subscriberMessageRecieved;
            }

            channel.subscriberNotify.subscriberStatusChange = createBoolean(channel.subscriberNotify.subscriberStatusChange);
            channel.subscriberNotify.subscriberMessageRecieved = createBoolean(channel.subscriberNotify.subscriberMessageRecieved);

            return channel;
        })

        cb(channels)
    });
}

module.exports = loadChannelsFromDb