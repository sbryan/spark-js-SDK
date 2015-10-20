var ADSKSpark = ADSKSpark || {};

(function () {
    'use strict';

    var Client = ADSKSpark.Client;

    // The printDB singleton.
    // TODO: Should we cache results?
    // TODO: There is a way to make this object's properties immutable. Is that something we would want to do?
    ADSKSpark.PrintDB = {
        /**
         * @param {String} [typeId] - The type ID. If not specified, return all printer types.
         * @returns {Promise} - A promise that will resolve with a list of printer types.
         */
        getPrinterType: function (typeId) {
            return Client.authorizedApiRequest('/printdb/printertypes/' + typeId)
                .get();
        },

        getPrinterTypes: function () {
            return Client.authorizedApiRequest('/printdb/printertypes')
                .get()
                .then(function (data) {
                    return data.printerTypes;
                });
        },

        /**
         * @param {String} [materialId] - The type ID. If not specified, return all materials.
         * @returns {Promise} - A promise that will resolve with a list of materials.
         */
        getMaterial: function (materialId) {
            materialId = materialId || '';
            return Client.authorizedApiRequest('/printdb/materials/' + materialId)
                .get();
        },

        /**
         * @param {String} [profileId] - The type ID. If not specified, return all profiles.
         * @param {Object} [params] - request parameters.
         * @returns {Promise} - A promise that will resolve with a list of profiles.
         */
        getProfile: function (profileId, params) {
            profileId = profileId || '';
            return Client.authorizedApiRequest('/printdb/profiles/' + profileId)
                .get(null, params);
        }
    };

}());
