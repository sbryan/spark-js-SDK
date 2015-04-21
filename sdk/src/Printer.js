var Spark = Spark || {};

(function () {
    var Client = Autodesk.Spark.Client;


    /**
     * A base class for paginated arrays of items.
     * @param {Object} data - JSON data.
     * @constructor
     */
    Spark.Paginated = function (data) {
        this._parse(data);
    };

    Spark.Paginated.prototype = Object.create(Array.prototype); // Almost-array
    Spark.Paginated.prototype.constructor = Spark.Paginated;

    Spark.Paginated.prototype._parse = function (data) {
        this.clear();
        this.raw = data;
    };

    /**
     * Return true if the previous link is valid.
     * @returns {boolean}
     */
    Spark.Paginated.prototype.hasPrev = function () {
        return this.raw._link_prev != '';
    };

    /**
     * Get previous items.
     * Updates this object with the new items.
     * @returns {?Promise} - A Promise that will resolve to an array of items.
     */
    Spark.Paginated.prototype.prev =  function () {
        var link_prev = this.raw._link_prev,
            that = this;

        if (link_prev) {
            return Client.authorizedApiRequest(link_prev)
                .get()
                .then(function (data) {
                    that._parse(data);
                    return that;
                });
        }
        return null;
    };

    /**
     * Return true if the next link is valid.
     * @returns {boolean}
     */
    Spark.Paginated.prototype.hasNext = function () {
        return this.raw._link_next != '';
    };

    /**
     * Get next items.
     * Updates this object with the new items.
     * @returns {?Promise} - A Promise that will resolve to an array of items.
     */
    Spark.Paginated.prototype.next = function () {
        var link_next = this.raw._link_next,
            that = this;

        if (link_next) {
            return Client.authorizedApiRequest(link_next)
                .get()
                .then(function (data) {
                    that._parse(data);
                    return that;
                });
        }
        return null;
    };


    /**
     * A paginated array of printers.
     * @param {Object} data - JSON data.
     * @constructor
     */
    Spark.Printers = function (data) {
        Spark.Paginated.call(this, data);
    };

    Spark.Printers.prototype = Object.create(Spark.Paginated);
    Spark.Printers.prototype.constructor = Spark.Printers;

    /**
     * Get printers registered to a member.
     * @param {Object} params - limit/offset/sort/filter options.
     * @returns {Promise} - A promise that will resolve to an array of printers.
     */
    Spark.Printers.get = function (params) {
        return Client.authorizedApiRequest('/print/printers')
            .get(params)
            .then(function (data) {
                return new Spark.Printers(data);
            });
    };

    Spark.Printers.prototype._parse = function (data) {
        Spark.Paginated.prototype._parse.apply(this, data);

        var printers = data.printers;
        if (Array.isArray(printers)) {
            var that = this;
            printers.forEach(function (printer) {
                that.push(new Spark.Printer(printer));
            });
        }
    };


    /**
     * A paginated array of jobs.
     * @param {Object} data - JSON data.
     * @constructor
     */
    Spark.Jobs = function (data) {
        Spark.Paginated.call(this, data);
    };

    Spark.Jobs.prototype = Object.create(Spark.Paginated);
    Spark.Jobs.prototype.constructor = Spark.Jobs;

    Spark.Jobs.prototype._parse = function (data) {
        Spark.Paginated.prototype._parse.apply(this, data);

        var jobs = data.printer_jobs;
        if (Array.isArray(jobs)) {
            var that = this;
            jobs.forEach(function (job) {
                that.push(job);
            });
        }
    };


    /**
     * A printer.
     * @param {Object} data - JSON data.
     * @constructor
     */
    Spark.Printer = function (data) {
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
    Spark.Printer.register = function (code, name) {
        return Client.authorizedApiRequest('/print/printers/register')
            .post(null, {registration_code: code, printer_name: name});

        // TODO: when api is fixed, this should resolve to new printer
        // TODO: until then, we could always call getById()?
        //  .then(function (data) {
        //      return new Spark.Printer(data);
        //  });
    };

    /**
     * Get a registered printer.
     * @param {String} id - Printer id.
     * @returns {Promise} - A Promise that will resolve to a printer.
     */
    Spark.Printer.getById = function (id) {
        return Client.authorizedApiRequest('/print/printers/' + id)
            .get()
            .then(function (data) {
                return new Spark.Printer(data);
            });
    };

    Spark.Printer.prototype = {

        constructor: Spark.Printer,

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

        _kLatestFirmwareVersion: "1.1.20150219.0", // TODO: add to config

        /**
         * Return true if the printer firmware needs to be updated.
         * @returns {boolean}
         */
        needsFirmwareUpgrade: function () {
            if (this.firmware) {
                if (printerFrontend.Utils.versionCompare(this.firmware, _kLatestFirmwareVersion) === -1) { // TODO: extract
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
         * @returns {Promise} - A Promise that will resolve to the task status.
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
         * @param {String} params
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
         * @returns {Promise} - A Promise that will resolve to the command and task_id.
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
                    return new Spark.Jobs(data);
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
        }
    };

})();
