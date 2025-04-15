let Channels = require('../Channels')

/**
 * Request, lai nosūtītu message visiem kanāla klientiem
 *
 * galvenie lauki
 *     message_type - pēc noklusējuma message
 *     message - pats message string, piemēram, invoice_updated
 *     payload - papildus dati json formātā
 */
function routeSetChannelClientStatusChangeListenerEndpoint(routeData, writeResponse, routeCompleted) {

    let channel = Channels.findByName(routeData.postData.channel);
    if (!channel) {
        routeCompleted();
        return;
    }

    let endpoints = routeData.postData.endpoints;
    if (!Array.isArray(endpoints)) {
        endpoints = [];
    }
    // filter out empty
    endpoints = endpoints.map(endpoints => endpoints.trim()).filter();

    channel.setClientStatusChangeListenerEndpoint(endpoints, function(){
        routeCompleted();
    });
}

module.exports = routeSetChannelClientStatusChangeListenerEndpoint