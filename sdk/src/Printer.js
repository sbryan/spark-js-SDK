var ADSKSpark = ADSKSpark || {};

(function () {
    var Client = Autodesk.Spark.Client;


    /**
     * A paginated array of printers.
     * @param {Object} data - JSON data.
     * @constructor
     */
    ADSKSpark.Printers = function (data) {
        ADSKSpark.Paginated.call(this, data);
    };

    ADSKSpark.Printers.prototype = Object.create(ADSKSpark.Paginated);
    ADSKSpark.Printers.prototype.constructor = ADSKSpark.Printers;

    /**
     * Get printers registered to a member.
     * @param {Object} params - limit/offset/sort/filter options.
     * @returns {Promise} - A promise that will resolve to an array of printers.
     */
    ADSKSpark.Printers.get = function (params) {
        return Client.authorizedApiRequest('/print/printers')
            .get(params)
            .then(function (data) {
                return new ADSKSpark.Printers(data);
            });
    };

    ADSKSpark.Printers.prototype._parse = function (data) {
        ADSKSpark.Paginated.prototype._parse.apply(this, data);

        var printers = data.printers;
        if (Array.isArray(printers)) {
            var that = this;
            printers.forEach(function (printer) {
                that.push(new ADSKSpark.Printer(printer));
            });
        }
    };


    /**
     * A printer.
     * @param {Object} data - JSON data.
     * @constructor
     */
    ADSKSpark.Printer = function (data) {
        this.id = data.printer_id;
        this.name = data.printer_name;
        this.firmware = data.firmware;
        this.type_id = data.type_id;
        this.raw = data;
        this.status = null;
    };

    /**
     * Register a printer to a member.
     * @param {String} code - Printer registration code.
     * @param {String} name - Printer nickname.
     * @returns {Promise} - A Promise that will resolve to a printer.
     */
    ADSKSpark.Printer.register = function (code, name) {
        return Client.authorizedApiRequest('/print/printers/register')
            .post(null, {registration_code: code, printer_name: name});

        // TODO: when api is fixed, this should resolve to new printer
        // TODO: until then, we could always call getById()?
        //  .then(function (data) {
        //      return new ADSKSpark.Printer(data);
        //  });
    };

    /**
     * Get a registered printer.
     * @param {String} id - Printer id.
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
            return Client.authorizedApiRequest('/print/printers/' + this.id)
                .get()
                .then(function (data) {
                    that.status = data;
                    return data;
                })
                .catch(function (error) {
                    that.status = null;
                });
        },

        /**
         * Return true if the printer is online.
         * This uses the result of the last call to getStatus().
         * @returns {boolean}
         */
        isOnline: function () {
            return this.status || this.raw.printer_last_health !== 'Offline';
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
         * @param {String} job_id
         * @returns {Promise}
         */
        pause: function (job_id) {
            return this.sendCommand('pause', {job_id: job_id});
        },

        /**
         * Resume a paused print job.
         * @param {String} job_id
         * @returns {Promise}
         */
        resume: function (job_id) {
            return this.sendCommand('resume', {job_id: job_id});
        },

        /**
         * Cancel a running print job.
         * @param {String} job_id
         * @returns {Promise}
         */
        cancel: function (job_id) {
            return this.sendCommand('cancel', {job_id: job_id});
        },

        /**
         * Reset the printer.
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

        _kLatestFirmwareVersion: "1.1.20150219.0", // TODO: ember only. add to config?

        /**
         * Return true if the printer firmware needs to be updated.
         * TODO: where to find this data for different printer versions?
         * @returns {boolean}
         */
        needsFirmwareUpgrade: function () {
            if (this.firmware) {
                if (this._versionCompare(this.firmware, _kLatestFirmwareVersion) === -1) {
                    return true;
                }
            }
            return false;
        },

        /**
         * Update the printer firmware.
         * @param {String} package_url
         * @returns {Promise}
         */
        firmwareUpgrade: function (package_url) {
            return this.sendCommand('firmware_upgrade', {package_url: package_url});
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
         * Send a command to the printer and wait for it to finish.
         * @param {String} command
         * @param {String} params
         * @param {Object} options
         * @returns {Promise} - A Promise that will resolve to the command status.
         */
        sendCommandAndWait: function (command, params, options) {
            this.sendCommand(command, params)
                .then(function (commandResponse) {
                    return this.waitForCommand(commandResponse.command, commandResponse.task_id, options);
                })
                .then(function (commandStatus) {
                     return commandStatus;
                });
        },

        /**
         * Send a command to the printer.
         * @param {String} command
         * @param {String} [params]
         * @returns {Promise} - A Promise that will resolve to the command and task_id.
         */
        sendCommand: function (command, params) {
            return Client.authorizedApiRequest('/print/printers/' + this.id + '/' + command)
                .post(params)
                .then(function (data) {
                    return {command: command, task_id: data.task_id};
                });
        },

        /**
         * Wait for a printer command to finish.
         * @param {String} command
         * @param {String} task_id
         * @param {Object} options
         * @returns {Promise} - A Promise that will resolve to the command status.
         */
        waitForCommand: function (command, task_id, options) {
            options = options || {};

            var freq = options.freq || 1000, // 1 sec
                timeout = options.timeout || 10000, // 10 sec
                start = +new Date(),
                url = '/print/printers/' + this.id + '/' + command,
                params = {task_id: task_id};

            return new Promise(function (resolve, reject) {
                var timerId = setInterval(function () {
                    Client.authorizedApiRequest(url)
                        .get(params)
                        .then(function (data) {
                            var is_error = ((data || {}).data || {}).is_error;
                            if (is_error) {
                                clearInterval(timerId);
                                reject(new Error(data.error_message));

                            } else {
                                if (options.onProgress) {
                                    options.onProgress(data);
                                }

                                if (data && 1.0 <= data.progress) {
                                    clearInterval(timerId);
                                    resolve(data);

                                } else {
                                    var now = +new Date();
                                    if (timeout <= (now - start)) {
                                        clearInterval(timerId);
                                        reject(new Error('timeout'));
                                    }
                                }
                            }
                        })
                        .catch(function (error) {
                            clearInterval(timerId);
                            reject(error);
                        });
                }, freq);
            });
        },

        /**
         * Unregister a printer.
         * @returns {Promise}
         */
        unregister: function () {
            return Client.authorizedApiRequest('/print/printers/' + this.id)
                .delete();
        },

        /**
         * Get jobs for a printer.
         * @param {Object} params - limit/offset/sort/filter options.
         * @returns {Promise} - A promise that will resolve to an array of jobs.
         */
        getJobs: function (params) {
            return Client.authorizedApiRequest('/print/printers/' + this.id + '/jobs')
                .get()
                .then(function (data) {
                    return new ADSKSpark.Jobs(data);
                });
        },

        /**
         * Create a print job.
         * @param {String} printable_id
         * @param {String} printable_url
         * @param {Object} settings
         * @param {String} callback_url
         * @returns {Promise}
         */
        createJob: function (printable_id, printable_url, settings, callback_url) {
            return Client.authorizedApiRequest('/print/printers/' + this.id + '/jobs')
                .post({
                    printable_id: printable_id,
                    printable_url: printable_url,
                    settings: settings,
                    callback_url: callback_url
                });
        },

        /**
         * Start a queued print job for a printer.
         * @param {String} job_id
         * @returns {Promise}
         */
        startJob: function (job_id) {
            return Client.authorizedApiRequest('/print/printers/' + this.id + '/jobs')
                .put({job_id: job_id});
        },

        // http://stackoverflow.com/questions/6832596/how-to-compare-software-version-number-using-js-only-number
        _versionCompare: function(v1, v2, options) {
            var lexicographical = options && options.lexicographical,
                zeroExtend = options && options.zeroExtend,
                v1parts = v1.split('.'),
                v2parts = v2.split('.');

            function isValidPart(x) {
                return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
            }

            if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
                return NaN;
            }

            if (zeroExtend) {
                while (v1parts.length < v2parts.length) v1parts.push("0");
                while (v2parts.length < v1parts.length) v2parts.push("0");
            }

            if (!lexicographical) {
                v1parts = v1parts.map(Number);
                v2parts = v2parts.map(Number);
            }

            for (var i = 0; i < v1parts.length; ++i) {
                if (v2parts.length == i) {
                    return 1;
                }

                if (v1parts[i] == v2parts[i]) {
                    continue;
                }
                else if (v1parts[i] > v2parts[i]) {
                    return 1;
                }
                else {
                    return -1;
                }
            }

            if (v1parts.length != v2parts.length) {
                return -1;
            }

            return 0;
        }
    };

})();
