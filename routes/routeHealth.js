function routeHealth(query, writeResponse, routeCompleted) {

    writeResponse('Pubsub server is running\n');

    routeCompleted();
}

module.exports = routeHealth