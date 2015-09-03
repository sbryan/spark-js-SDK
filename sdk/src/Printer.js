var ADSKSpark = ADSKSpark || {};

(function () {
    'use strict';

    var Client = ADSKSpark.Client;

    /**
     * A paginated array of printers.
     * @param {Object} data - JSON data.
     * @constructor
     */
    ADSKSpark.Printers = function (data) {
        ADSKSpark.Paginated.call(this, data);
    };

    ADSKSpark.Printers.prototype = Object.create(ADSKSpark.Paginated.prototype);
    ADSKSpark.Printers.prototype.constructor = ADSKSpark.Printers;

    /**
     * Get printers registered to a member.
     * @param {Object} params - limit/offset/sort/filter options.
     * @returns {Promise} - A promise that will resolve to an array of printers.
     */
    ADSKSpark.Printers.get = function (params) {
        return Client.authorizedApiRequest('/print/printers')
            .get(null, params)
            .then(function (data) {
                return new ADSKSpark.Printers(data);
            });
    };

    ADSKSpark.Printers.prototype.parse = function (data) {
        ADSKSpark.Paginated.prototype.parse.call(this, data);
        if (data) {
            var printers = data.printers;
            if (Array.isArray(printers)) {
                var that = this;
                printers.forEach(function (printer) {
                    that.push(new ADSKSpark.Printer(printer));
                });
            }
        }
    };

    /**
     * A paginated array of members registered for a printer.
     * @param {Object} data - JSON data.
     * @constructor
     */
    ADSKSpark.PrinterMembers = function (data) {
        ADSKSpark.Paginated.call(this, data);
    };

    ADSKSpark.PrinterMembers.prototype = Object.create(ADSKSpark.Paginated.prototype);
    ADSKSpark.PrinterMembers.prototype.constructor = ADSKSpark.PrinterMembers;

    ADSKSpark.PrinterMembers.prototype.parse = function (data) {
        ADSKSpark.Paginated.prototype.parse.call(this, data);
        if (data) {
            var members = data.members;
            if (Array.isArray(members)) {
                var that = this;
                members.forEach(function (member) {
                    that.push(member);
                });
            }
        }
    };

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
        //  .then(function(data) {
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
         * Check printer status.
         * @returns {Promise} - A Promise that will resolve to the status information.
         */
        getStatus: function () {
            var that = this;
            return Client.authorizedApiRequest('/print/printers/status/' + this.printer_id)
                .get()
                .then(function (data) {
                    that.status = data;
                    return data;
                })
                .catch(function (error) {
                    that.status = null;
                    throw error;
                });
        },

        /**
         * Return true if the printer is online.
         * This uses the result of the last call to getStatus().
         * @returns {boolean}
         */
        isOnline: function () {
            return this.status || this.data.printer_last_health !== 'Offline';
        },

        /**
         * Return true if the printer is printing.
         * This uses the result of the last call to getStatus().
         * @returns {boolean}
         */
        isPrinting: function () {
            var state = (((this.status || {}).last_reported_state || {}).data || {}).state;
            return /^(?:Exposing|Printing|Printing Layer|Separating)$/.test(state);
        },

        /**
         * Pause a running print job.
         * @param {ADSKSpark.Job|string} job - Job or job id.
         * @returns {Promise}
         */
        pause: function (job) {
            var jobId = (job instanceof ADSKSpark.Job) ? job.id : job;
            return this.sendCommand('pause', {job_id: jobId});
        },

        /**
         * Resume a paused print job.
         * @param {ADSKSpark.Job|string} job - Job or job id.
         * @returns {Promise}
         */
        resume: function (job) {
            var jobId = (job instanceof ADSKSpark.Job) ? job.id : job;
            return this.sendCommand('resume', {job_id: jobId});
        },

        /**
         * Cancel a running print job.
         * @param {ADSKSpark.Job|string} job - Job or job id.
         * @returns {Promise}
         */
        cancel: function (job) {
            var jobId = (job instanceof ADSKSpark.Job) ? job.id : job;
            return this.sendCommand('cancel', {job_id: jobId});
        },

        /**
         * Reboot the printer.
         * @returns {Promise}
         */
        reset: function () {
            return this.sendCommand('reset');
        },

        /**
         * Run a printer specific calibration routine.
         * @returns {Promise}
         */
        calibrate: function () {
            return this.sendCommand('calibrate');
        },

        /**
         * Update the printer firmware.
         * @param {string} packageUrl
         * @returns {Promise}
         */
        firmwareUpgrade: function (packageUrl) {
            return this.sendCommand('firmware_upgrade', {package_url: packageUrl});
        },

        /**
         * Printer returns a public URL to the uploaded logs.
         * @returns {Promise}
         */
        log: function () {
            return this.sendCommand('log');
        },

        /**
         * Moves all actuators to their home configuration.
         * @returns {Promise}
         */
        home: function () {
            return this.sendCommand('home');
        },

        /**
         * Moves all actuators to their park configuration.
         * @returns {Promise}
         */
        park: function () {
            return this.sendCommand('park');
        },

        /**
         * Send a command to the printer.
         * @param {string} command
         * @param {string} [params]
         * @returns {Promise} - A Promise that will resolve to the task_id.
         */
        sendCommand: function (command, params) {
            params = params || {};
            params.command = command;

            var headers = {'Content-Type': 'application/json'};

            params = JSON.stringify(params);

            return Client.authorizedApiRequest('/print/printers/' + this.printer_id + '/command')
                .post(headers, params)
                .then(function (data) {
                    return data;
                });
        },

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
         * Get the members registered to this printer.
         * @param {Object} params - limit/offset/sort/filter options.
         * @returns {Promise} A Promise that resolves to an array of members.
         */
        getMembers: function (params) {
            return Client.authorizedApiRequest('/print/printers/' + this.printer_id + '/members')
                .get(null, params)
                .then(function (data) {
                    return new ADSKSpark.PrinterMembers(data);
                });
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
        },

        /**
         * Get jobs for a printer.
         * @param {Object} params - limit/offset/sort/filter options.
         * @returns {Promise} - A promise that will resolve to an array of jobs.
         */
        getJobs: function (params) {
            return Client.authorizedApiRequest('/print/printers/' + this.printer_id + '/jobs')
                .get(null, params)
                .then(function (data) {
                    return new ADSKSpark.Jobs(data);
                });
        },

        /**
         * Create a print job.
         * @param {string} printableId
         * @param {string} printableUrl
         * @param {Object} settings
         * @param {string} callbackUrl
         * @returns {Promise}
         */
        createJob: function (printableId, printableUrl, settings, callbackUrl) {
            var headers = {'Content-Type': 'application/json'},
                payload = JSON.stringify({
                    printable_id: printableId,
                    printable_url: printableUrl,
                    settings: settings,
                    callback_url: callbackUrl
                });
            return Client.authorizedApiRequest('/print/printers/' + this.printer_id + '/jobs')
                .post(headers, payload);
        },

        /**
         * Start a queued print job for a printer.
         * @param {ADSKSpark.Job|string} job - Job or job id.
         * @returns {Promise}
         */
        startJob: function (job) {
            var jobId = (job instanceof ADSKSpark.Job) ? job.id : job,
                headers = {'Content-Type': 'application/json'},
                payload = JSON.stringify({job_id: jobId});
            return Client.authorizedApiRequest('/print/printers/' + this.printer_id + '/jobs')
                .put(headers, payload);
        }
    };

}());
