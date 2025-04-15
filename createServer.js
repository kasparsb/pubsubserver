let http = require('http');
let url = require('url');
let querystring = require('querystring');

/**
 * šī metode atšķirībā no querystring.parse(postBody)
 * pārveidos masīva laukus par masīvu
 */
function parsePostBody(body) {
    let r = {};

    let params = new URLSearchParams(body);

    for (let [key, value] of params) {
        // Check if the key contains array notation (e.g., field[0], field[1])
        let arrayMatch = key.match(/^(.+)\[(\d+)\]$/);

        if (arrayMatch) {
            let fieldName = arrayMatch[1];
            let index = parseInt(arrayMatch[2]);

            if (!Array.isArray(r[fieldName])) {
                r[fieldName] = [];
            }

            r[fieldName][index] = value;
        }
        else {
            r[key] = value;
        }
    }

    return r;
}

function onPostBody(request, cb) {

    /**
     * @todo jāpieliek content-type pārbaude
     */
    // request.headers['content-type'] == 'application/x-www-form-urlencoded'

    let postBody = '';
    request.on('data', function(data){
        postBody += data;
    })
    request.on('end', function(data){
        cb(parsePostBody(postBody));
        //cb(querystring.parse(postBody));
    })
}

function handleRequest(request, response, routes) {

    let requestUrl = url.parse(request.url, true);

    let route = routes.match(request.method, requestUrl.pathname);

    // max execution time
    let requestTimeout = setTimeout(function(){
        response.write('request timed out');
        response.end();
    }, 5000)

    // POST
    if (request.method == 'POST' || request.method == 'DELETE') {
        onPostBody(request, postData => {

            route.handler(
                {
                    method: request.method,
                    query:requestUrl.query,
                    params: route.params,
                    postData: postData
                },
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

        })
    }
    else {
        route.handler(
            {
                method: request.method,
                query:requestUrl.query,
                params: route.params
            },
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