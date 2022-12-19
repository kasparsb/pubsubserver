let ClientsList = require('../ClientsList')
let Channels = require('../Channels')

let messageStatus = require('../message/status');

function socketOnClose(client, reasonCode, description) {

    /**
     * Liekam pazīmi, ka disconnected
     * Bet, ja gadījumā tomēr ienāk ziņa no client, tad
     * liekam atpakaļ kā connected
     *
     * Tādu gadījumu, kad client nostrādā close, bet reāli ping
     * nāk iekšā ir bijis
     */
    ClientsList.disconnect(client);

    Channels.notifySubscriberStatusChange(
        client.channel,
        messageStatus('disconnect', client)
    );
}
module.exports = socketOnClose;
