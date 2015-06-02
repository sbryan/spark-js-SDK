var ADSKSpark = ADSKSpark || {};

(function() {
    'use strict';

    var Helpers = ADSKSpark.Helpers;

    var GUEST_TOKEN_KEY = 'spark-guest-token';
    var ACCESS_TOKEN_KEY = 'spark-access-token';

    var _clientId = '';
    var _apiUrl = '';
    var _guestTokenUrl = '';
    var _accessTokenUrl = '';
    var _refreshTokenUrl = '';
    var _redirectUri = '';

    /**
     * Gets an access_token and stores it in localStorage, afterwards returns a promise that resolves to the guest token.
     *
     * @returns {Promise} - A promise that resolves to the guest token.
     */
    var getGuestTokenFromServer = function() {
        return ADSKSpark.Request(_guestTokenUrl).get().then(function(data) {
            var now = Date.now();
            data.expires_at = now + parseInt(data.expires_in) * 1000;
            localStorage.setItem(GUEST_TOKEN_KEY, JSON.stringify(data));
            return data.access_token;
        });
    };

    /**
     * @class Represents a Client
     * @description - The Client API singleton that allows to call various api methods
     * See reference - https://spark.autodesk.com/developers/reference/authentication
     */
    ADSKSpark.Client = {

        /**
         * @description - Initializes the client.
         * @memberOf ADSKSpark.Client
         * @param {String} clientId - The app key provided when you registered your app.
         * @param {String} guestTokenUrl - The URL of your authentication server used for guest tokens. This server should
         *                                 handle exchanging the client secret for a guest token.
         * @param {String} accessTokenUrl - The URL of your authentication server used for access tokens. This server should
         *                                 handle exchanging a provided code for an access token.
         * @param {String} refreshTokenUrl - The URL of your authentication server used to refresh access tokens. This server
         *                                  should call the refresh token api (extend the expiry time) and return a new valid
         *                                  access token.
         * @param {String} apiUrl - The URL of the spark api. (Ex. https://sandbox.spark.autodesk.com/api/vi)
         * @param {String} [redirectUri] - The URI that the Spark OAuth service will return the browser to
         */
        initialize: function(clientId, guestTokenUrl, accessTokenUrl, refreshTokenUrl, apiUrl, redirectUri) {
            _clientId = clientId;
            _guestTokenUrl = guestTokenUrl;
            _accessTokenUrl = accessTokenUrl;
            _refreshTokenUrl = refreshTokenUrl;
            _apiUrl = apiUrl;
            _redirectUri = redirectUri;
        },

        /**
         * @description - Returns the URL to redirect to for logging in.
         * @memberOf ADSKSpark.Client
         * @param {String} showRegisterScreen - Whether to show the register screen as the default
         * @returns {String} - The URL.
         */
        getLoginRedirectUrl: function(showRegisterScreen) {

            var apiRedirectUrl = _apiUrl + '/oauth/authorize' +
                '?response_type=code' +
                '&client_id=' + _clientId;

            if (_redirectUri) {
                apiRedirectUrl += "&redirect_uri=" + _redirectUri;
            }

            if (showRegisterScreen){
                apiRedirectUrl += '&register=true';
            }

            return apiRedirectUrl;

        },

        /**
         * @description - Clears access token that had been stored in localStorage
         * @memberOf ADSKSpark.Client
         */
        logout: function() {
            localStorage.removeItem(ACCESS_TOKEN_KEY);
        },

        /**
         * @description - Completes the login process, gets an access_token and stores it in localStorage.
         * @memberOf ADSKSpark.Client
         * @param {String} code - The code that was returned after the user signed in. {@see ADSKSpark.Client#login}
         * @returns {Promise} - A promise that resolves to the access token.
         */
        completeLogin: function(code) {
            var params = {code: code};

            if (_redirectUri) {
                params.redirect_uri = _redirectUri;
            }

            return ADSKSpark.Request(_accessTokenUrl).get(undefined, params).then(function(data) {
                if (data && data.expires_in && data.access_token) {
                    var now = Date.now();
                    data.expires_at = now + parseInt(data.expires_in) * 1000;
                    localStorage.setItem(ACCESS_TOKEN_KEY, JSON.stringify(data));

                    return data.access_token;
                }
                return Promise.reject(new Error(data.Error));
            });
        },

        /**
         * @description - Checks if the access token exists and has not expired.
         * @memberOf ADSKSpark.Client
         * @returns {Boolean} - True if the access token exists and has not expired. Otherwise, false.
         */
        isAccessTokenValid: function() {
            var accessToken = JSON.parse(localStorage.getItem(ACCESS_TOKEN_KEY));
            var now = Date.now();

            return !!(accessToken && accessToken.expires_at && accessToken.expires_at > now);
        },

        /**
         * @description - Returns the full access token object if one is currently in local storage. Null otherwise.
         * @memberOf ADSKSpark.Client
         * @returns {?String} - The access token or null if not found.
         */
        getAccessTokenObject: function() {
            var accessToken = JSON.parse(localStorage.getItem(ACCESS_TOKEN_KEY));

            return (accessToken && accessToken.access_token) ? accessToken : null;
        },

        /**
         * @description - Returns the access_token if one is currently in local storage. Null otherwise.
         * @memberOf ADSKSpark.Client
         * @returns {?String} - The access token or null if not found.
         */
        getAccessToken: function() {
            var accessToken = JSON.parse(localStorage.getItem(ACCESS_TOKEN_KEY));

            return (accessToken && accessToken.access_token) ? accessToken.access_token : null;
        },

        /**
         * @description - Return a promise that resolves to the guest token.
         * This will attempt to retrieve the token from local storage. If it's missing, a call will be made to
         * the authentication server.
         * @memberOf ADSKSpark.Client
         * @returns {Promise} - A promise that resolves to the guest token.
         */
        getGuestToken: function() {
            var guestToken = JSON.parse(localStorage.getItem(GUEST_TOKEN_KEY));
            var now = Date.now();
            if (guestToken && guestToken.expires_at && guestToken.expires_at > now) {
                return Promise.resolve(guestToken.access_token);
            }

            return getGuestTokenFromServer();
        },


        /**
         * @description - Refreshes the access token to extend its expiry and returns a promise that resolves to the access token object
         * @memberOf ADSKSpark.Client
         * @returns {Promise} - A promise that resolves to the access token object.
         */
        refreshAccessToken: function() {
            var accessTokenObj = this.getAccessTokenObject();

            if (accessTokenObj) {
                var refreshToken = accessTokenObj.refresh_token;
                return ADSKSpark.Request(_refreshTokenUrl)
                    .get(null, {refresh_token: refreshToken})
                    .then(function(data) {
                        var now = Date.now();
                        data.expires_at = now + parseInt(data.expires_in) * 1000;
                        localStorage.setItem(ACCESS_TOKEN_KEY, JSON.stringify(data));
                        return data;
                    });
            }

            return Promise.reject(new Error('Access token does not exist, you need to login again'));

        },

        /**
         * @description - Request the API with an access token (if exists)
         * @memberOf ADSKSpark.Client
         * @param {String} endpoint - The API endpoint to query
         * @param {Object} [options] - Additional options that are supported by Request

         * @returns {ADSKSpark.Request} - The request object that abstracts REST APIs
         */
        authorizedApiRequest: function (endpoint, options) {
            var _this = this;
            options = options || {};

            function formatAuthHeader(token) {
                return token ? ('Bearer ' + token.access_token) : null;
            }


            return ADSKSpark.Request(_apiUrl + endpoint, function () {
                return new Promise(function (resolve) {
                    var token = JSON.parse(localStorage.getItem(ACCESS_TOKEN_KEY));
                    if (token) {
                        // If the token has an expires_at property and the token
                        // has expired, then refresh it.
                        //
                        var now = Date.now();

                        if (token.expires_at && now > token.expires_at) {
                            _this.refreshAccessToken()
                                .then(function (refreshedToken) {
                                    resolve(formatAuthHeader(refreshedToken));
                                });
                        } else {
                            resolve(formatAuthHeader(token));
                        }

                    } else {
                        resolve(null);
                    }
                });
            },options);
        },

        /**
         * @description - Request the API with a guest token (if exists)
         * @memberOf ADSKSpark.Client
         * @param {String} endpoint - The API endpoint to query
         * @param {Object} [options] - Additional options that are supported by Request
         *
         * @returns {ADSKSpark.Request} - The request object that abstracts REST APIs
         */
        authorizedAsGuestApiRequest: function (endpoint, options) {
            var _this = this;
            options = options || {};
            return ADSKSpark.Request(_apiUrl + endpoint, function () {
                return new Promise(function (resolve) {
                    _this.getGuestToken().then(function (token) {
                        resolve(token ? ('Bearer ' + token) : null);
                    });
                });
            },options);

        },

        /**
         * @description - Open an auth window
         * @memberOf ADSKSpark.Client
         */
        openLoginWindow: function() {
            Helpers.popupWindow(this.getLoginRedirectUrl(), 350, 600);
        }
    };

}());
