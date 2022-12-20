let mysql = require('mysql2');
let connection = mysql.createConnection({
    host: '192.168.2.1',
    user: 'root',
    password: 'bbbbbbbb',
    database: 'pubsub',
    port: 3371
});

let isConnected = false;

function insert(tableName, data) {
    let fields = [];
    let values = [];
    let valuesPlaceholders = [];
    // Loop through data props
    for (let field in data) {
        fields.push(field);
        let value = data[field];
        if (typeof  data[field] == 'object') {
           value = JSON.stringify(value); 
        }
        values.push(value);
        valuesPlaceholders.push('?'); 
    }

    let sql = 'INSERT INTO '+connection.escapeId(tableName)+' ('+fields.join(',')+') VALUES ('+valuesPlaceholders+')';
    query(sql, values);
}

function query(sql, values) {
    connection.query(sql, values, function(err){
        if (err) {
            console.log(err.sqlMessage);
        }
    });
}

function getRows(sql, values, cb) {
    connection.query(sql, values, function(err, rows) {
        cb(rows)
    });
}

function connect(successCb) {
    connection.connect(function(err){
        if (err) {
            console.log(err);
        }
        else {
            successCb();
        }
    });
}

function disconnect() {
    connection.end();
}

module.exports = {
    query: query,
    insert: insert,
    getRows: getRows,
    connect: connect,
    disconnect: disconnect
}
