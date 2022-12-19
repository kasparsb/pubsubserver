/**
 * Message, ko sūta uz subscriber vai notify endpoint
 * vajag zināt, kas ir sūtītājs
 * Ja sūta App, tad sūtītāja nebūs
 * Ja sūta subscriber, tad būs sūtītājs
 */
function message(message, payload, senderSubscriber) {
    let r = {
        type: 'message',
        message: message,
    }

    if (typeof payload != 'undefined') {
        r.payload = payload;
    }

    if (typeof senderSubscriber != 'undefined') {
        r.sender = senderSubscriber.data;
    }

    return r;
}

module.exports = message