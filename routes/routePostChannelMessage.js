let Channels = require('../Channels')
let message = require('../message/message');

/**
 * Request, lai nosūtītu message visiem kanāla klientiem
 *
 * galvenie lauki
 *     message_type - pēc noklusējuma message
 *     message - pats message string, piemēram, invoice_updated
 *     payload - papildus dati json formātā
 */
function routePostChannelMessage(query, postData, writeResponse, routeCompleted) {

    Channels.sendMessage(
        postData.channel,
        message(
            postData.message_type,
            postData.message,
            postData.payload,
            postData.payload_type
        )
    );

    routeCompleted();
}

module.exports = routePostChannelMessage