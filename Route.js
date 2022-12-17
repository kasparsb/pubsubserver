let routes = {};

// Define default routes, which responds to any non defined note
routes['GET:default'] = function(query, writeResponse){
    writeResponse('GET:default')
}
routes['POST:default'] = function(query, writeResponse){
    writeResponse('POST:default')
}

/**
 * Define GET, POST routes
 *
 * Store in object, map by route path
 *
 * Return all defined routes, so that you can pass
 * all routes to server
 */
module.exports = {
    get: function(pathname, cb) {
        routes['GET:'+pathname] = cb;
    },
    post: function(pathname, cb) {
        routes['POST:'+pathname] = cb;
    },
    default: function(cb) {
        routes['GET:default'] = cb;
        routes['POST:default'] = cb;
    },
    all: function(){
        return {
            match: function(method, pathname){
                let routeName = method+':'+pathname

                if (typeof routes[routeName] == 'undefined') {
                    routeName = method+':default'
                }

                return routes[routeName];
            }
        }
    }
}