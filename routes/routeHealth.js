function routeHealth(routeData, writeResponse, routeCompleted) {

    writeResponse('Pubsub server is running\n');

    routeCompleted();
}

module.exports = routeHealth