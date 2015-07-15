var ADSKSpark = ADSKSpark || {};

(function () {
    'use strict';

    /**
     * @class
     * @description - Our helpers object
     */
    ADSKSpark.Helpers = {

        /**
         * @description - Open window in the center of the screen
         * @memberOf ADSKSpark.Helpers
         * @param url - The URL to open in a window
         * @param w - Width of the window
         * @param h - Height of the window
         * @returns {*} - The window.open object
         */
        popupWindow: function (url, w, h) {
            var left = (screen.width / 2) - (w / 2);
            var top = (screen.height / 3) - (h / 3);
            return window.open(url, '_blank', 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
        },

        /**
         * @description - Transform parameter strings to array of params
         * @memberOf ADSKSpark.Helpers
         * @param {String} prmstr - The GET query string
         * @returns {Object} - Associative array of parameters
         */
        transformToAssocArray: function (prmstr) {
            var params = {};

            if (prmstr) {
                var prmarr = prmstr.split('&');
                for (var i = 0; i < prmarr.length; i++) {
                    var tmparr = prmarr[i].split('=');
                    params[tmparr[0]] = tmparr[1];
                }
            }

            return params;
        },

        /**
         * @description - Extract params from URL
         * @memberOf ADSKSpark.Helpers
         * @param {String} prmstr - The GET query string
         * @returns {Object} - URL parameters
         */
        extractParamsFromURL: function (prmstr) {
            prmstr = prmstr || window.location.search.substr(1) || window.location.hash.substr(1);

            return prmstr ? this.transformToAssocArray(prmstr) : {};
        },

        /**
         * @description - Convert some json to an encoded parameter string.
         * For example {k1: v1, k2: v2} -> 'k1=v1&k2=v2'.
         * @memberOf ADSKSpark.Helpers
         * @param {Object} json.
         * @param {function|string[]|string} [filter] Optional json key filter.
         * @returns {!string}
         */
        jsonToParameters: function (json, filter) {
            if (!json) {
                return null;
            }

            var keys = Object.keys(json);
            if (0 === keys) {
                return null;
            }

            if (filter) {
                if (typeof filter === 'function') {
                    keys = keys.filter(filter);
                } else if (Array.isArray(filter)) {
                    keys = keys.filter(function (key) {
                        return filter.indexOf(key) === -1;
                    });
                } else { // string
                    keys = keys.filter(function (key) {
                        return key !== filter;
                    });
                }
            }

            return keys.map(function (key) {
                return encodeURIComponent(key) + '=' + encodeURIComponent(json[key]);
            }).join('&');
        },

        /**
         * @description - Checks whether some supplied ID that is supposed to be an integer is valid
         * @memberOf ADSKSpark.Helpers
         * @param itemId - Such as assetId or fileId or memberId
         * @returns {*|boolean}
         */
        isValidId: function (itemId) {
            return itemId && 0 === itemId % (!isNaN(parseFloat(itemId)) && 0 <= itemId);
        },

        /**
         * @description - Checks whether some array of supplied IDs are of postive integer type.
         * @memberOf ADSKSpark.Helpers
         * @param itemIds - Such as assetIds or fileIds or memberIds
         * @returns {*|boolean}
         */
        isValidIds: function (itemIds) {

            if (!itemIds) {
                return false;
            }
            var arrayForm = itemIds.toString().split(',');
            if (arrayForm.length === 0) {
                return false;
            }
            for (var i = 0; i < arrayForm.length; i++) {
                if (!this.isValidId(arrayForm[i])) {
                    return false;
                }
            }
            return true;
        },

        /**
         * Overwrites obj1's values with obj2's and adds obj2's if non existent in obj1
         * @param obj1
         * @param obj2
         * @returns {Object} obj3 a new object based on obj1 and obj2
         */
        mergeObjects: function (obj1, obj2) {
            var obj3 = {};
            for (var attrname1 in obj1) {
                obj3[attrname1] = obj1[attrname1];
            }
            for (var attrname2 in obj2) {
                obj3[attrname2] = obj2[attrname2];
            }
            return obj3;
        },

        /**
         * Change url from HTTP to HTTPS
         * @param url
         * @returns the same string changed to https
         */
        changeHttpToHttps: function (url) {
            if (url && url.indexOf("http:") > -1) {
                url = url.replace("http:", "https:");
            }
            return url;
        },

        /**
         * Get the code param in URL after returning from Spark Auth flow
         */
        extractRedirectionCode: function (prmstr) {
            var getParams = this.extractParamsFromURL(prmstr);
            return getParams.code;
        },

        /**
         * Get the access token and expiry param in URL after returning from Spark Auth flow
         */
        extractRedirectionTokenData: function (prmstr) {
            var getParams = this.extractParamsFromURL(prmstr);
            var data = {};
            data.access_token = getParams.access_token;
            data.expires_in = getParams.expires_in;
            return data;
        },

        /**
         * Calculates redirect uri according to the window.location.href while omitting the parameters part (? or #)
         * @returns {string} - the uri calculated
         */
        calculateRedirectUri: function (prmstr) {
            if (!prmstr) {
                prmstr = window.location.href;
            }
            var questionMarkIndex = prmstr.indexOf('?');
            var hashMarkIndex = prmstr.indexOf('#');
            var uri = prmstr;
            if (questionMarkIndex > -1) {
                uri = uri.substring(0, questionMarkIndex);
            } else if (hashMarkIndex > -1) {
                uri = uri.substring(0, hashMarkIndex);

            }

            return uri;
        }
    };

}());
