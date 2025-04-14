function routeDefault(routeData, writeResponse, routeCompleted) {
    writeResponse(routeData.method+':pubsub');
    routeCompleted();
}

module.exports = routeDefault