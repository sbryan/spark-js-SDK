/**
 * @namespace
 */
var ADSKSpark = ADSKSpark || {};

(function () {
	'use strict';

	var Constants = ADSKSpark.Constants,
		Client = ADSKSpark.Client,
		Helpers = ADSKSpark.Helpers;


	ADSKSpark.ServiceBureaus = {

		getServiceBureaus: function () {

			var headers = {'Content-Type': 'application/json'};

		    return Client.authorizedApiRequest('/servicebureaus').get(headers);

			return Promise.reject(new Error('An error occurred'));
		},

		getSparkMaterials: function () {

			var headers = {'Content-Type': 'application/json'};

			return Client.authorizedApiRequest('/servicebureaus/materials').get(headers);

			return Promise.reject(new Error('An error occurred'));
		},

		getQuotes: function (items) {

			var headers = {'Content-Type': 'application/json'};

			return Client.authorizedApiRequest('/servicebureaus/quickquotes').post(headers, items);

			return Promise.reject(new Error('An error occurred'));
		},

		getCartUrl: function (serviceBureauId, items) {

			var headers = {'Content-Type': 'application/json'};

			return Client.authorizedApiRequest('/servicebureaus/' + serviceBureauId + '/submit').post(headers, items);

			return Promise.reject(new Error('An error occurred'));
		}

	};


}());
