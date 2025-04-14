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
function routePostSetClientStatusChangeListenerEndpoint(query, postData, writeResponse, routeCompleted) {

    let channel = Channels.findByName(postData.channel);
    if (!channel) {
        routeCompleted();
        return;
    }

    let endpoints = postData.endpoints;
    if (!Array.isArray(endpoints)) {
        endpoints = [];
    }
    // filter out empty
    endpoints = endpoints.map(endpoints => endpoints.trim()).filter();

    channel.setClientStatusChangeListenerEndpoint(endpoints, function(){
        routeCompleted();
    });
}

module.exports = routePostSetClientStatusChangeListenerEndpoint