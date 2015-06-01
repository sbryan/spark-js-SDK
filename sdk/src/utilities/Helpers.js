var ADSKSpark = ADSKSpark || {};

(function() {
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
		popupWindow: function(url, w, h) {
			var left = (screen.width / 2) - (w / 2);
			var top = (screen.height / 3) - (h / 3);
			return window.open(url, '_blank', 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
		},

		/**
		 * @description - Transform parameter strings to array of params
		 * @memberOf ADSKSpark.Helpers
		 * @param {String} prmstr - The GET query string
		 * @returns {Array} - Associative array of parameters
		 */
		transformToAssocArray: function(prmstr) {
			var params = [];
			if (prmstr) {
				var prmarr = prmstr.split("&");
				for (var i = 0; i < prmarr.length; i++) {
					var tmparr = prmarr[i].split("=");
					params[tmparr[0]] = tmparr[1];
				}
			}
			return params;
		},

		/**
		 * @description - Extract params from URL
		 * @memberOf ADSKSpark.Helpers
		 * @param {String} prmstr - The GET query string
		 * @returns {Array} - URL parameters
		 */
		extractParamsFromURL: function(prmstr) {
			prmstr = prmstr || window.location.search.substr(1);
			var getParams = prmstr ? this.transformToAssocArray(prmstr) : [];

			return getParams;
		},

		/**
		 * @description - Convert some json to an encoded parameter string.
		 * For example {k1: v1, k2: v2} -> 'k1=v1&k2=v2'.
		 * @memberOf ADSKSpark.Helpers
		 * @param {Object} json.
		 * @param {function|string[]|string} [filter] Optional json key filter.
		 * @returns {!string}
		 */
		jsonToParameters: function(json, filter) {
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
					keys = keys.filter(function(key) {
						return filter.indexOf(key) === -1;
					});
				} else { // string
					keys = keys.filter(function(key) {
						return key !== filter;
					});
				}
			}

			return keys.map(function(key) {
				return encodeURIComponent(key) + '=' + encodeURIComponent(json[key]);
			}).join('&');
		},
		/**
		 * @description - Checks whether some supplied ID that is supposed to be an integer is valid
		 * @memberOf ADSKSpark.Helpers
		 * @param itemId - Such as assetId or fileId or memberId
		 * @returns {*|boolean}
		 */
		isValidId: function(itemId) {
			return itemId && 0 === itemId % (!isNaN(parseFloat(itemId)) && 0 <= itemId);
		},

		/**
		 * @description - Checks whether some array of supplied IDs are of postive integer type.
		 * @memberOf ADSKSpark.Helpers
		 * @param itemIds - Such as assetIds or fileIds or memberIds
		 * @returns {*|boolean}
		 */
		isValidIds: function(itemIds) {

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
		}


	};

}());