/**
 * @namespace
 */
var ADSKSpark = ADSKSpark || {};

(function () {
    'use strict';

    var Client = ADSKSpark.Client;

    var verifyItems = function (itemsObjStr) {
        var result = false;
        try {
            var itemsObj = JSON.parse(itemsObjStr);
            if (itemsObj.items && itemsObj.items.length) {
                result = true;
            }
        }
        catch(e) {
        }
        return result;
    };

    var verifyModels = function (modelsObjStr) {
        var result = false;
        try {
            var modelsObj = JSON.parse(modelsObjStr);
            if (modelsObj.models && modelsObj.models.length) {
                result = true;
            }
        }
        catch(e) {
        }
        return result;
    };

    /**
     * @class
     * @type {{getServiceBureaus: getServiceBureaus, getSparkMaterials: getSparkMaterials, getQuotes: getQuotes, getCartUrl: getCartUrl}}
     * @description - The ServiceBureaus API singleton.
     * See reference - https://spark.autodesk.com/developers/reference/servicebureaus
     */
    ADSKSpark.ServiceBureaus = {

        /**
         * @description - Get service bureaus list
         * @memberOf ADSKSpark.ServiceBureaus
         * @returns {Promise} - A promise that will resolve to an array of service bureaus
         */
        getServiceBureaus: function () {

            var headers = {'Content-Type': 'application/json'};

            return Client.authorizedApiRequest('/servicebureaus').get(headers);
        },

        /**
         * @description - Get Spark materials list
         * @memberOf ADSKSpark.ServiceBureaus
         * @returns {Promise} - A promise that will resolve to an array of spark materials
         */
        getSparkMaterials: function () {

            var headers = {'Content-Type': 'application/json'};

            return Client.authorizedApiRequest('/servicebureaus/materials').get(headers);
        },

        /**
         * @description - Get quotes from service bureaus
         * @memberOf ADSKSpark.ServiceBureaus
         * @param {String} items - JSON (as a string) that holds the items and have the following structure: { 'items': [ {'material_id': selectedMaterialId,'files': [{"file_id":fileId}]}] }
         * @returns {Promise} - A promise that will resolve to an array of spark materials
         */
        getQuotes: function (items) {

            if (verifyItems(items)) {

                var headers = {'Content-Type': 'application/json'};

                return Client.authorizedApiRequest('/servicebureaus/quickquotes').post(headers, items);
            }

            return Promise.reject(new Error('Invalid items object'));
        },

        /**
         * @description - Get cart url from a specific service bureau
         * @memberOf ADSKSpark.ServiceBureaus
         * @param {String} serviceBureauId - The service bureau id ( guid )
         * @param {String} models - JSON (as a string) that holds the models and have the following structure: { 'models' : [ {'file_id' : currentFileId, 'file_name' : fileName, 'quantity':1} ] }
         * @returns {Promise} - A promise that will resolve to a cart url
         */
        getCartUrl: function (serviceBureauId, models) {

            if (verifyModels(models) && serviceBureauId && serviceBureauId.length) {

                var headers = {'Content-Type': 'application/json'};

                return Client.authorizedApiRequest('/servicebureaus/' + serviceBureauId + '/submit').post(headers, models);
            }

            return Promise.reject(new Error('Invalid service bureau id or items object'));
        }

    };


}());
