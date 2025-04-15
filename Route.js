let routes = new Map();
routes.set('get', new Map());
routes.set('post', new Map());
routes.set('delete', new Map());

// Default handlers
routes.get('get').set('default', defaultRouteHandler);
routes.get('post').set('default', defaultRouteHandler);
routes.get('delete').set('default', defaultRouteHandler);

function defaultRouteHandler(routeData, writeResponse, endResponse) {
    writeResponse(routeData.method+':default');
    endResponse();
}

function matchRoutePatternToRoute(routePattern, route) {
    // Split pattern and route into segments
    let patternSegments = routePattern.split('/').filter(Boolean);
    let routeSegments = route.split('/').filter(Boolean);

    // Check if lengths match
    if (patternSegments.length !== routeSegments.length) {
        return null;
    }

    // Params extracted from route
    let params = {};

    for (let i = 0; i < patternSegments.length; i++) {
        let patternSeg = patternSegments[i];
        let routeSeg = routeSegments[i];

        // Check if route param (wrapped in {)
        if (patternSeg.startsWith('{') && patternSeg.endsWith('}')) {
            params[patternSeg.slice(1, -1)] = routeSeg;
        }
        else if (patternSeg !== routeSeg) {
            return false;
        }
    }

    return {
        params,
        routePattern
    };
}

function findRoute(routePatterns, pathname) {
    for (let routePattern of routePatterns.keys()) {
        let matchedRoute = matchRoutePatternToRoute(routePattern, pathname);
        if (matchedRoute) {
            return {
                handler: routePatterns.get(matchedRoute.routePattern),
                route: matchedRoute.routePattern,
                params: matchedRoute.params
            }
        }
    }

    return null;
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
        routes.get('get').set(pathname, cb);
    },
    post: function(pathname, cb) {
        routes.get('post').set(pathname, cb);
    },
    delete: function(pathname, cb) {
        routes.get('delete').set(pathname, cb);
    },
    default: function(cb) {
        routes.get('get').set('default', cb);
        routes.get('post').set('default', cb);
    },
    all: function(){
        return {
            match: function(method, pathname){
                method = method.toLowerCase();

                let route;
                if (routes.has(method)) {
                    route = findRoute(routes.get(method), pathname);
                }

                // Default route
                if (!route) {
                    route = {
                        handler: routes.get(method).get('default'),
                        route: method+':default',
                        params: {}
                    }
                }

                return route;
            }
        }
    }
}