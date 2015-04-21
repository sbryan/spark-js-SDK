var ADSKSpark = ADSKSpark || {};

(function() {
    var Client = ADSKSpark.Client = {};

    var _clientId = '';
    var _clientSecret = '';
    var _base64ClientCode = '';
    var _apiVersion = 'v1';
    var _apiUrl = '';
    var _accessToken = '';

    Client.initialize = function(clientId, clientSecret, apiUrl, options) {
        _clientId = clientId;
        _clientSecret = clientSecret;
        _apiUrl = apiUrl;

        if (options && options.apiVersion) {
            _apiVersion = options.apiVersion;
        }

        // Used for basic authentication
        _base64ClientCode = window.btoa(_clientId + ':' + _clientSecret);
    };

    Client.login = function() {

    };

    Client.logout = function() {

    };

    Client.completeLogin = function(code) {

    };

    Client.getToken = function() {

    };

    Client.basicApiRequest = function(api) {
        return ADSKSpark.Request(_apiUrl + '/api/' + _apiVersion + api, 'Bearer ' + _base64ClientCode);
    };

    Client.authorizedApiRequest = function(api) {
        return ADSKSpark.Request(_apiUrl + '/api/' + _apiVersion + api, 'Bearer ' + _accessToken);
    };
}());
