let mysql = require('mysql2');
let formatDate = require('./helpers/formatDate');

let connection = false;
let isConnected = false;

function insert(tableName, data, cb) {
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
    query(sql, values, function(results){
        cb(results.insertId);
    });
}

function update(tableName, data, where, cb) {
    let fields = [];
    let values = [];
    // Loop through data props
    for (let field in data) {
        fields.push(field+'=?');
        let value = data[field];
        if (typeof  data[field] == 'object') {
           value = JSON.stringify(value);
        }
        values.push(value);
    }
    // Where
    let qw = [];
    for (let field in where) {
        qw.push(field+'=?');
        values.push(where[field]);
    }

    let sql = 'UPDATE '+connection.escapeId(tableName)+' SET '+fields+' WHERE '+qw.join(' AND ');
    query(sql, values, cb);
}

function insertOrUpdate(tableName, data, where, cb) {
    let qw = [];
    let qwv = []
    for (let field in where) {
        qw.push(field+'=?');
        qwv.push(where[field]);
    }
    qw = 'select id from '+connection.escapeId(tableName)+' where '+qw.join(' AND ');
    connection.query(qw, qwv, function(err, rows){
        if (err) {
            console.log(err.sqlMessage);
            return;
        }

        if (rows.length > 0) {
            update(tableName, data, where, cb)
        }
        else {
            insert(tableName, data, cb)
        }
    });
}

function chunk(perPage, sql, cb, doneCb) {
    let offset = 0;

    function q() {
        query(sql+' LIMIT '+perPage+' OFFSET '+offset, [], function(results){
            cb(results)

            offset += perPage;
            if (results.length > 0) {
                q();
            }
            else {
                doneCb()
            }
        })
    }

    q();
}

function query(sql, values, cb) {
    connection.query(sql, values, function(err, results){
        if (err) {
            console.log(err.sqlMessage);
        }
        if (cb) {
            cb(results);
        }
    });
}

function getRows(sql, values, cb) {
    connection.query(sql, values, function(err, rows) {
        cb(rows)
    });
}

function connect(successCb) {
    connection = mysql.createConnection({
        host: '192.168.2.1',
        user: 'root',
        password: 'bbbbbbbb',
        database: 'pubsub',
        port: 3371
    });

    /**
     * mysql2 pats veic connect. tikai nevar saprast kurā mirklī
     * vai createConnection vai query laikā
     */
    successCb();

    // connection.connect(function(err){
    //     if (err) {
    //         console.log(err);
    //     }
    //     else {
    //         successCb();
    //     }
    // });
}

function disconnect() {
    connection.end();
}

module.exports = {
    query: query,
    insert: insert,
    update: update,
    insertOrUpdate: insertOrUpdate,
    now: function(){
        //return mysql.raw('CURRENT_TIMESTAMP()')
        return formatDate.ymdhis(new Date())
    },
    getRows: getRows,
    chunk: chunk,
    connect: connect,
    disconnect: disconnect
}
