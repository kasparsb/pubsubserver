function dumpChannels(channels) {
    console.log('------------------------------');
    console.log('CHANNELS');
    channels.forEach(channel => {
        console.log(channel.name+' '+channel.listenerNotifyEndpoints.subscriberStatusChange[0]+' '+channel.listenerNotifyEndpoints.subscriberMessageRecieved[0])
    })
    console.log('------------------------------');
}

module.exports = dumpChannels