/**
 * Sūtam subscriber statusu
 * līdzi tiek sūtīts payload, kurā ir subscriber info
 */
function status(status, client) {
    return {
        type: 'status',
        status: status,
        client: client.data
    }
}

module.exports = status