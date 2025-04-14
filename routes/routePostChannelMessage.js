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
function routePostChannelMessage(routeData, writeResponse, routeCompleted) {

    Channels.sendMessage(
        routeData.postData.channel,
        message(
            routeData.postData.message_type,
            routeData.postData.message,
            routeData.postData.payload,
            routeData.postData.payload_type
        )
    );

    routeCompleted();
}

module.exports = routePostChannelMessage