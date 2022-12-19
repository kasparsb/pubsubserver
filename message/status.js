/**
 * Sūtam subscriber statusu
 * līdzi tiek sūtīts payload, kurā ir subscriber info
 */
function status(status, subscriber) {
    return {
        type: 'status',
        status: status,
        subscriber: subscriber.data
    }
}

module.exports = status