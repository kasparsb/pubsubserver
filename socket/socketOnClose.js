let Channels = require('../Channels')

function socketOnClose(client, reasonCode, description) {
    let channel = Channels.findByName(client.channel);
    if (channel) {
        channel.disconnectClient(client);
    }
}
module.exports = socketOnClose;
