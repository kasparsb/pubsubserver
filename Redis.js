let redis = require('redis');

let client = redis.createClient({
    url: 'redis://192.168.2.1:6367/3'
});

client.on('error', (err) => console.log('Redis Client Error', err));

function scan(key, count, onPortionCb, doneCb) {
    let getPortion = function(cursor) {

        client
            .SSCAN(key, cursor, {
                MATCH: '*',
                COUNT: count
            })
            .then(data => {

                onPortionCb(data.members)

                // Exit when cursor is 0, not when data.members is empty
                if (data.cursor == 0) {
                    doneCb();
                }

            });
    }

    // Start from cursor 0
    getPortion(0)
}

module.exports = {
    connect(cb) {
        client.connect().then(cb);
    },
    set(key, value, cb) {
        client.set(key, value).then(cb)
    },
    get(key, cb) {
        client.get(key, value).then(function(value){
            cb(value)
        })
    },
    scan: scan,
    multi() {
        return client.multi();
    },
    client() {
        return client
    }
}