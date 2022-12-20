function routeDefault(query, writeResponse, routeCompleted) {
    writeResponse('pubsub');
    routeCompleted();
}

module.exports = routeDefault