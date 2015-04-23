var ADSKSpark = ADSKSpark || {};

(function() {
    var Client = ADSKSpark.Client = {};
    var GUEST_TOKEN_KEY = 'spark-guest-token';

    var _clientId = '';
    var _apiUrl = '';
    var _guestTokenUrl = '';
    var _accessTokenUrl = '';
    var _accessToken = '';

    // Helper functions
    var getGuestTokenFromServer = function() {
        return ADSKSpark.Request(_guestTokenUrl).get().then(function(data) {
            var date = new Date();
            var now = date.getTime();
            data.expires_at = now + parseInt(data.expires_in) * 1000;
            localStorage.setItem(GUEST_TOKEN_KEY, JSON.stringify(data));

            return data.access_token;
        });
    };

    /**
     * Initializes the client.
     *
     * @param {String} clientId - The app key provided when you registered your app.
     * @param {String} guestTokenUrl - The URL of your authentication server used for guest tokens. This server should
     *                                 handle exchanging the client secret for a guest access token.
     * @param {String} accessTokenUrl - The URL of your authentication server used for access tokens. This server should
     *                                 handle exchanging a provided code for an access token.
     * @param {String} apiUrl - The URL of the spark api. (Ex. https://sandbox.spark.autodesk.com/api/vi)
     */
    Client.initialize = function(clientId, guestTokenUrl, accessTokenUrl, apiUrl) {
        _clientId = clientId;
        _guestTokenUrl = guestTokenUrl;
        _accessTokenUrl = accessTokenUrl;
        _apiUrl = apiUrl;
    };

    Client.login = function() {

    };

    Client.logout = function() {

    };

    Client.completeLogin = function(code) {

    };

    Client.getToken = function() {

    };

    /**
     * Return a promise that resolves to the guest access token.
     * This will attempt to retrieve the token from local storage. If it's missing, a call will be made to
     * the authentication server.
     *
     * @returns {Promise} - A promise that resolves to the guest token.
     */
    Client.getGuestToken = function() {
        var guestToken = JSON.parse(localStorage.getItem(GUEST_TOKEN_KEY));
        var now = Date.now();
        if (guestToken && guestToken.expires_at && guestToken.expires_at > now)
            return Promise.resolve(guestToken.access_token);

        return getGuestTokenFromServer();
    };

    Client.authorizedApiRequest = function(endpoint) {
        var authorization;

        if( _accessToken )
            authorization = 'Bearer ' + _accessToken;

        return ADSKSpark.Request(_apiUrl + endpoint, authorization);
    };
}());
