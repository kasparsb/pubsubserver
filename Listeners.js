let channelChangeEvent = require('./message/channelChangeEvent');
let subscriberChangeEvent = require('./message/subscriberChangeEvent');

let dumpListeners = require('./helpers/dumpListeners');

let listeners = {};


function aforeach(iespejamsarray, cb) {
    if (typeof iespejamsarray == 'undefined') {
        return
    }

    iespejamsarray.forEach(cb)
}

function addtoarray(obj, key, subscriber) {
    if (typeof obj[key] == 'undefined') {
        obj[key] = [];
    }

    // Parbaudām vai šis subscriber jau nav masīvā
    if (!obj[key].find(s => s.id == subscriber.id)) {
        obj[key].push(subscriber)
    }
}



function triggerChannelChange(channel, data) {
    aforeach(listeners['channelChange:'+channel.name], subscriber => {
        subscriber.connection.sendUTF(JSON.stringify(channelChangeEvent([
            [channel, data]
        ])))
    })
}

function triggerSubscriberChange(subscriber) {
    aforeach(listeners['subscriberChange:'+subscriber.id], listener => {
        listener.connection.sendUTF(JSON.stringify(subscriberChangeEvent([
            subscriber
        ])))
    })
}

function addListener(subscriber, eventName, subjects) {

    subjects.forEach(subject => {

        // Pieliekam uz kādiem eventName parakstīts subscriber
        if (!subscriber.listeningOn.find(i => i.eventName == eventName && i.subject == subject)) {
            subscriber.listeningOn.push({
                eventName: eventName,
                subject: subject
            })
        }

        addtoarray(listeners, eventName+':'+subject, subscriber)
    })

    dumpListeners(listeners);
    console.log(subscriber.listeningOn);
}

/**
 * Novācam visus subscriber eventus uz ko parakstījies
 */
function removeListener(subscriber, eventName, subjects) {

    if (typeof eventName == 'undefined') {
        eventName = 'all';
    }
    if (typeof subjects == 'undefined') {
        subjects = 'all'
    }

    subscriber.listeningOn.forEach(event => {

        if (eventName != 'all') {
            // Pārbaudām vai ir padotais eventName
            if (event.eventName != eventName) {
                return;
            }
        }

        if (subjects != 'all') {
            if (!subjects.includes(event.subject)) {
                return;
            }
        }




        for (let i = 0; i < listeners[event.eventName+':'+event.subject].length; i++) {
            if (listeners[event.eventName+':'+event.subject][i].id == subscriber.id) {
                listeners[event.eventName+':'+event.subject].splice(i, 1);
                i--;
            }
        }
    })



    for (let i = 0; i < subscriber.listeningOn.length; i++) {
        if (eventName != 'all') {
            // Pārbaudām vai ir padotais eventName
            if (eventName != subscriber.listeningOn[i].eventName) {
                continue;
            }
        }

        if (subjects != 'all') {
            if (!subjects.includes(subscriber.listeningOn[i].subject)) {
                continue;
            }
        }

        subscriber.listeningOn.splice(i, 1);
        i--;

    }

    dumpListeners(listeners);
    console.log(subscriber.listeningOn);
}

module.exports = {
    triggerChannelChange: triggerChannelChange,
    triggerSubscriberChange: triggerSubscriberChange,
    add: addListener,
    remove: removeListener
}