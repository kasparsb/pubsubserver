function subscriberChangeEvent(subscribers) {
    return {
        type: 'subscriberChange',
        payload: subscribers.map(subscriber => {
            return {
                subscriber: subscriber.id,
                /**
                 * @todo šito laukus vajag, lai jau glabājas pie
                 * subscriber
                 * šo pašu izmanto StateStore
                 * Tad abās vietās, gan StateStore, gan šeit
                 * dati tiks ņemti no vienas un tās pašas vietas
                 */
                data: {
                    id: subscriber.id,
                    channel_id: subscriber.channel.id,
                    subscriber_id: subscriber.data.client,
                    ip: subscriber.ip,

                    created_at: subscriber.created_at,
                    connected_at: subscriber.connected_at,
                    disconnected_at: subscriber.disconnected_at,
                    pong_at: subscriber.pong_at,

                    status: subscriber.status
                }
            }
        })
    }
}

module.exports = subscriberChangeEvent