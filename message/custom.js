function custom(messagType, message, payload, senderSubscriber) {
    let r = {
        type: messagType,
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

module.exports = custom