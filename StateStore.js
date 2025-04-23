let Redis = require('./Redis');
let formatDate = require('./helpers/formatDate');

/**
 * Maintain SET of registered channels
 * When will be time to clean up state, then read
 * channels from this SET and clean up channels SET
 *
 * Add subscriber to channel
 * and set subscriber data
 *
 * Every channel has its own SET channel+channe.id
 *     there will be stored all channel connected subscribers
 *FState
 */
function addSubscriber(subscriber) {
    // Channels SET
    Redis.client().SADD('channels', subscriber.channel.id+'');

    // Channel set, te būs visu subscribers id
    Redis.client().SADD('channel:'+subscriber.channel.id, subscriber.id);

    // SET, te glabājam subscriber datus
    updateSubscriberData(subscriber)
}

function removeSubscriber(subscriber) {
    Redis.multi()
        // Dzēšam subscriber datus
        .DEL('subscriber:'+subscriber.id)
        // Izmetam no channel SET
        .SREM('channel:'+subscriber.channel.id, subscriber.id)
        .exec();
}

/**
 * HASH laukā glabājam subscriber datus
 * subscriber identificējas pēc ID
 *
 * Klienta datiem tiek uzstādīts expire
 */
function updateSubscriberData(subscriber) {
    let data = {
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
    let transaction = Redis.multi();
    for (let field in data) {
        transaction.HSET('subscriber:'+subscriber.id, field, data[field]);
    }
    transaction.EXPIRE('subscriber:'+subscriber.id, 60*5);
    transaction.exec();
}

function setChannelSubscribersCount(channel, subscribersCount) {
    Redis.client().SET('channel:subscribers_count:'+channel.id, subscribersCount)
}

module.exports = {
    updateSubscriberData: updateSubscriberData,
    addSubscriber: addSubscriber,
    removeSubscriber: removeSubscriber,
    setChannelSubscribersCount: setChannelSubscribersCount
}