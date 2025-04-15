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
        // Match array notation with nested levels (e.g., level1[level2][level3])
        let parts = key.split('[');
        if (parts.length > 1) {
            let current = r;
            let lastIndex = parts.length - 1;

            // Process each part of the key
            parts.forEach((part, index) => {
                // Remove closing bracket if present
                let cleanKey = part.replace(']', '');

                // If not the last part, we need to create an object/array
                if (index < lastIndex) {
                    let nextPart = parts[index + 1].replace(']', '');
                    let isNextNumeric = !isNaN(parseInt(nextPart));

                    // Create array if next part is numeric, otherwise object
                    if (isNextNumeric) {
                        if (!Array.isArray(current[cleanKey])) {
                            current[cleanKey] = [];
                        }
                    }
                    else {
                        if (!current[cleanKey]) {
                            current[cleanKey] = {};
                        }
                    }
                    current = current[cleanKey];
                }
                else {
                    // Last part - assign the value
                    current[cleanKey] = value;
                }
            });
        }
        else {
            // Simple key-value pair
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