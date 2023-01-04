let Redis = require('./Redis');
let formatDate = require('./helpers/formatDate');

/**
 * Iztīrām visus iepriekš reģistrētos channels
 * Tas notiek, kad app ielādējas, tad kanāls ir tukšs,
 * jo vēl nav neviens pieslēdzies.
 * Tāpēc izdzēšam visus iepriekš kanālā reģistrētos subscribers
 */
function cleanUp(doneCb) {

    // Scan through all previously registered channels and delete them
    Redis.scan('channels', 100, function(channels){

        let transaction = Redis.multi();
        // Remove up channel SET
        channels.forEach(channelId => {
            transaction.DEL('channel:'+channelId)
        })
        transaction.exec();

    }, function(){
        // Remove channels SET, so it will be empty
        Redis.client().DEL('channels');

        doneCb();
    })
}

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
 *
 */
function addSubscriber(subscriber) {
    // Channels SET
    Redis.client().SADD('channels', subscriber.channel.id+'');

    // Channel set, te būs visu subscribers id
    Redis.client().SADD('channel:'+subscriber.channel.id, subscriber.id);

    // SET, te glabājam subscriber datus
    setSubscriberData(subscriber, {
        channel_id: subscriber.channel.id,
        subscriber_id: subscriber.data.client,
        ip: subscriber.ip,

        created_at: formatDate.ymdhis(new Date()),
        connected_at: formatDate.ymdhis(new Date()),
        disconnected_at: '',

        status: 'connected'
    })
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
function setSubscriberData(subscriber, data) {
    let transaction = Redis.multi();
    for (let field in data) {
        transaction.HSET('subscriber:'+subscriber.id, field, data[field]);
    }
    transaction.EXPIRE('subscriber:'+subscriber.id, 60*5);
    transaction.exec();
}

function setSubscriberStatusConnected(subscriber) {
    setSubscriberData(subscriber, {
        status: 'connected',
        connected_at: formatDate.ymdhis(new Date()),
        disconnected_at: ''
    })
}

function setSubscriberStatusDisconnected(subscriber) {
    setSubscriberData(subscriber, {
        status: 'disconnected',
        disconnected_at: formatDate.ymdhis(new Date()),
    })
}
function setSubscriberStatusPong(subscriber) {
    setSubscriberData(subscriber, {
        pong_at: formatDate.ymdhis(new Date())
    })
}

module.exports = {
    cleanUp: cleanUp,
    setSubscriberData: setSubscriberData,
    addSubscriber: addSubscriber,
    removeSubscriber: removeSubscriber,
    setSubscriberStatusConnected: setSubscriberStatusConnected,
    setSubscriberStatusDisconnected: setSubscriberStatusDisconnected,
    setSubscriberStatusPong: setSubscriberStatusPong
}