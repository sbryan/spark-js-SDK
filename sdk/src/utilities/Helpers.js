var ADSKSpark = ADSKSpark || {};

/**
 * @class
 * Our utilities object
 */
ADSKSpark.Helpers = function () {
	'use strict';

	/**
	 * Return the factory object
	 */
	var helpers = {

		/**
		 * Open window in the center of the screen
		 * @param url
		 * @param title
		 * @param w
		 * @param h
		 * @returns {*}
		 */
		popupWindow: function (url, w, h) {
			var left = (screen.width / 2) - (w / 2);
			var top = (screen.height / 3) - (h / 3);
			return window.open(url, '_blank', 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
		},

		/**
		 * Transform parameter strings to array of params
		 * @param prmstr
		 * @returns {{}}
		 */
		transformToAssocArray: function (prmstr) {
			var params = {};
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
		 * Extract params from URL
		 * @returns {{}}
		 */
		extractParamsFromURL: function (prmstr) {
			prmstr = prmstr || window.location.search.substr(1);
			var getParams = prmstr ? helpers.transformToAssocArray(prmstr) : [];

			return getParams;
		},

		/**
		 * Convert some json to an encoded parameter string.
		 * For example {k1: v1, k2: v2} -> 'k1=v1&k2=v2'.
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
		 * Checks whether some supplied ID that is supposed to be an integer is valid
		 * @param itemId - Such as assetId or fileId or memberId
		 * @returns {*|boolean}
		 */
		isValidId: function (itemId) {
			return itemId && !isNaN(itemId);
		},

		/**
		 * Checks whether some array of supplied IDs are of postive integer type.
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
				if (!arrayForm[i]) {
					return false;
				}
				if (isNaN(arrayForm[i])){
					return false;
				}
				if (arrayForm[i] !== parseInt(arrayForm[i], 10)){
					return false;
				}
				if (arrayForm[i] < 0){
					return false;
				}
			}
			return true;
		}
	};

	return helpers;

}();
