/**
 * from command line run
 * node cli.js namespace:command arg1 arg2 ...
 */
let consoleChannelsCreate = require('./console/consoleChannelsCreate');
let consoleChannelsShow = require('./console/consoleChannelsShow');

let commands = {
    'channels:create': consoleChannelsCreate,
    'channels:show': consoleChannelsShow
}


// Nolasām namespace:command argument
let command = process.argv[2];

callConsoleCommand(command, process.argv.slice(3));

function allDone() {

}

function callConsoleCommand(command, args) {

    if (typeof commands[command] == 'undefined') {
        console.log('This command '+command+' is not registered');
        allDone();
    }
    else {

        commands[command](args, allDone)

    }
}