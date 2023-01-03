let redis = require('redis');

let client = redis.createClient({
    url: 'redis://192.168.2.1:6367/3'
});

client.on('error', (err) => console.log('Redis Client Error', err));

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
    client() {
        return client
    }
}