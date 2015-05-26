var ADSKSpark = ADSKSpark || {};

(function () {
	var Client = ADSKSpark.Client;

	/**
	 * A printer.
	 * @param {Object} data - JSON data.
	 * @constructor
	 */
	ADSKSpark.Printer = function (data) {
		this.printer_id = this.id = data.printer_id || data.id;
		this.printer_name = this.name = data.printer_name || data.name;
		this.firmware = data.firmware;
		this.type_id = data.type_id;
		this.is_primary = data.is_primary;
		this.printer_last_health = data.printer_last_health;
		this.data = data;
		this.status = null;
	};

	/**
	 * Register a printer to a printer owner.
	 * @param {string} name - Printer name.
	 * @param {string} code - Printer registration code.
	 * @param {string} [memberId] - Secondary member id if registering as a printer user.
	 * @returns {Promise}
	 */
	ADSKSpark.Printer.register = function (name, code, memberId) {
		var headers = {'Content-Type': 'application/json'},
			payload = JSON.stringify({
				printer_name: name,
				registration_code: code,
				secondary_member_id: memberId
			});

		return Client.authorizedApiRequest('/print/printers/register')
			.post(headers, payload)
			.then(function (data) {
				if (data.registered) {
					return ADSKSpark.Printer.getById(data.printer_id);
				}
				return Promise.reject(new Error('not registered'));
			});

		// TODO: when api is fixed, this can be simplified
		//  .then(function (data) {
		//      if (data.registered) {
		//          return new ADSKSpark.Printer(data);
		//      }
		//      return Promise.reject(new Error('not registered'));
		//  });
	};

	/**
	 * Get a registered printer.
	 * @param {string} id - Printer id.
	 * @returns {Promise} - A Promise that will resolve to a printer.
	 */
	ADSKSpark.Printer.getById = function (id) {
		return Client.authorizedApiRequest('/print/printers/' + id)
			.get()
			.then(function (data) {
				return new ADSKSpark.Printer(data);
			});
	};

	ADSKSpark.Printer.prototype = {

		constructor: ADSKSpark.Printer,

		/**
		 * Set printer member role.
		 * @param {string} secondaryMemberId
		 * @param {boolean} isPrinterScoped - true if the member is allowed to send general commands to the printer.
		 * @param {boolean} isJobScoped - true if the member is allowed to send jobs to the printer.
		 * @returns {Promise}
		 */
		setMemberRole: function (secondaryMemberId, isPrinterScoped, isJobScoped) {
			if (this.is_primary) {
				var headers = {'Content-Type': 'application/json'},
					payload = JSON.stringify({
						secondary_member_id: secondaryMemberId,
						is_printer_scoped: isPrinterScoped,
						is_job_scoped: isJobScoped
					});

				return Client.authorizedApiRequest('/print/printers/' + this.printer_id + '/member_role')
					.post(headers, payload);
			}
			return Promise.reject(new Error('not printer owner'));
		},

		/**
		 * Generate a registration code for this printer.
		 * @param {string} secondaryMemberEmail
		 * @returns {Promise} A promise that resolves to the registration code.
		 */
		generateRegistrationCode: function (secondaryMemberEmail) {
			if (this.is_primary) {
				var headers = {'Content-Type': 'application/json'},
					payload = JSON.stringify({secondary_member_email: secondaryMemberEmail});
				return Client.authorizedApiRequest('/print/printers/' + this.printer_id + '/secondary_registration')
					.post(headers, payload)
					.then(function (data) {
						return data.registration_code;
					});
			}
			return Promise.reject(new Error('not printer owner'));
		},

		/**
		 * Unregister a printer.
		 * @param {string} [secondaryMemberId]
		 * @returns {Promise}
		 */
		unregister: function (secondaryMemberId) {
			var headers = {'Content-Type': 'application/json'},
				payload = secondaryMemberId ? JSON.stringify({secondary_member_id: secondaryMemberId}) : null;
			return Client.authorizedApiRequest('/print/printers/' + this.printer_id)
				.delete(headers, payload);
		}


	};

})();

