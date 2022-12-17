/**
 * from command line run
 * node cli.js namespace:command arg1 arg2 ...
 */
let Mysql = require('./Mysql');

let consoleChannelsCreate = require('./console/consoleChannelsCreate');
let consoleChannelsShow = require('./console/consoleChannelsShow');

let commands = {
    'channels:create': consoleChannelsCreate,
    'channels:show': consoleChannelsShow
}


// Nolasām namespace:command argument
let command = process.argv[2];

callConsoleCommand(command, process.argv.slice(3));


/**
 * Kad visas darbības beigas
 */
function allDone() {
    Mysql.disconnect();
}

function callConsoleCommand(command, args) {

    if (typeof commands[command] == 'undefined') {
        console.log('This command '+command+' is not registered');
    }
    else {
        // Pieslēdzamie pie DB un izsaucam komandu
        Mysql.connect(function(){

            commands[command](args, allDone)

        });

    }
}