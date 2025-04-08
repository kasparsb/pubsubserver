function message(messagType, message, payload, payloadType, senderSubscriber) {

    if (!messagType) {
        messagType = 'message';
    }

    if (!payloadType) {
        payloadType = 'json';
    }

    let r = {
        type: messagType,
        message: message,
    }

    if (payload) {
        r.payload = payload;
        r.payload_type = payloadType;

        if (payloadType == 'json') {
            try {
                r.payload = JSON.parse(r.payload);
            }
            catch(e) {

            }
        }
    }

    if (typeof senderSubscriber != 'undefined') {
        r.sender = senderSubscriber.data;
    }

    return r;
}

module.exports = message