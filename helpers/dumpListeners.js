function dumpListeners(listeners) {
    console.log('------------------------------');
    console.log('LISTENERS');
    for (let eventName in listeners) {
        console.log(eventName);
        listeners[eventName].forEach(function(listener){
            console.log('    '+listener.id);
        })
    }
    console.log('------------------------------');
}

module.exports = dumpListeners