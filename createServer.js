let http = require('http');
let url = require('url');

function handleRequest(request, response, routes) {

    let requestUrl = url.parse(request.url, true);

    let route = routes.match(request.method, requestUrl.pathname);

    // max execution time
    let requestTimeout = setTimeout(function(){
        response.write('request timed out');
        response.end();
    }, 5000)

    route(
        requestUrl.query,
        // Callback for writing to response
        function(responseData){
            response.write(responseData)
        },
        // When route done its job
        function(){
            clearTimeout(requestTimeout);
            response.end();
        }
    )
}

function createServer(port, listenIp, routes) {

    let server = http.createServer(function(request, response){
        handleRequest(request, response, routes)
    });

    server.listen(port, listenIp, function() {
        console.log('litening on port '+port);
    });

    return server
}

module.exports = createServer;