let channelChangeEvent = require('./message/channelChangeEvent');

let listeners = {};


function aforeach(iespejamsarray, cb) {
    if (typeof iespejamsarray == 'undefined') {
        return
    }

    iespejamsarray.forEach(cb)
}

function addtoarray(obj, key, valueToAdd) {
    if (typeof obj[key] == 'undefined') {
        obj[key] = [];
    }

    obj[key].push(valueToAdd)
}



function triggerChannelChange(channel, data) {
    aforeach(listeners['channelChange:'+channel.name], subscriber => {
        subscriber.connection.sendUTF(JSON.stringify(channelChangeEvent([
            [channel, data]
        ])))
    })
}

function addListener(subscriber, eventName, subjects) {

    subjects.forEach(subject => {

        // Pieliekam uz kādiem eventName parakstīts subscriber
        subscriber.listeningOn.push({
            eventName: eventName,
            subject: subject
        })

        addtoarray(listeners, eventName+':'+subject, subscriber)
    })

    console.log(listeners);
}

/**
 * Novācam visus subscriber eventus uz ko parakstījies
 */
function removeListener(subscriber) {

    subscriber.listeningOn.forEach(event => {
        for (let i = 0; i < listeners[event.eventName+':'+event.subject].length; i++) {
            if (listeners[event.eventName+':'+event.subject][i].id == subscriber.id) {
                listeners[event.eventName+':'+event.subject].splice(i, 1);
                i--;
            }
        }
    })

    console.log(listeners);
}

module.exports = {
    triggerChannelChange: triggerChannelChange,
    add: addListener,
    remove: removeListener
}