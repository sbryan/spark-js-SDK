AutodeskNamespace('Autodesk.Spark');

// A wrapper for XHR requests that returns a promise.
// Usage: Autodesk.Spark.Request('http://alpha.spark.autodesk.com/api/v1/printDB/printers').get([headers[, data]]).then(...);
// Based on https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise#Example_using_new_XMLHttpRequest()
/**
 * @param {String} url - The url for the request.
 * @param {String} [authorization] - If specified, the Authorization header will be set with this value by default.
 */
Autodesk.Spark.Request = function(url, authorization) {
    var makeRequest = function(method, headers, data) {
        headers = headers || {};
        if (!headers.hasOwnProperty('Content-Type')) {
            headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }

        var payload = '';

        if (data) {
            var argcount = 0;
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    if (argcount++) {
                        payload += '&';
                    }
                    payload += encodeURIComponent(key) + '=' + encodeURIComponent(data[key]);
                }
            }
        }

        var promise = new Promise(function(resolve, reject) {
            var xhr = new XMLHttpRequest();

            xhr.open(method, url);

            // Set the headers
            for (var header in headers) {
                if (headers.hasOwnProperty(header)) {
                    xhr.setRequestHeader(header, headers[header]);
                }
            }

            if (authorization && !headers.hasOwnProperty('Authorization')) {
                xhr.setRequestHeader('Authorization', authorization);
            }

            xhr.onload = function() {
                if (this.status === 200) {
                    resolve(JSON.parse(this.responseText));
                } else {
                    reject(new Error(this.statusText));
                }
            };
            xhr.onerror = function() {
                // if the request failed, it's probably due to a 404
                reject(new Error(404));
            };

            xhr.send(payload);
        });

        return promise;
    };

    return {
        'get': function(headers, data) {
            return makeRequest('GET', headers, data);
        },
        'post': function(headers, data) {
            return makeRequest('POST', headers, data);
        },
        'put': function(headers, data) {
            return makeRequest('PUT', headers, data);
        },
        'delete': function(headers, data) {
            return makeRequest('DELETE', headers, data);
        }
    };
};
