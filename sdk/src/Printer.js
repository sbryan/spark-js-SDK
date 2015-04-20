AutodeskNamespace('Autodesk.Spark');

(function () {
    var Client = Autodesk.Spark.Client;

    // TODO: when retrieving a printer, should we automatically call getStatus?

    Autodesk.Spark.Printers = function (data) {
        this._parse(data);
        return this;
    };

    Autodesk.Spark.Printers.prototype = Object.create(Array.prototype); // Almost-Array
    Autodesk.Spark.Printers.prototype.constructor = Autodesk.Spark.Printers;

    /**
     * Get printers registered to a member.
     * @param {Object} params - limit/offset/sort/filter options.
     * @returns {Promise} - A promise that will resolve to an array of printers.
     */
    Autodesk.Spark.Printers.get = function (params) {
        return Client.authorizedApiRequest('/print/printers')
            .get()
            .then(function (data) {
                return new Spark.Printers(data);
            });
    };

    /**
     * Return true if the previous printers link is valid.
     * @returns {boolean}
     */
    Autodesk.Spark.Printers.prototype.hasPrev = function () {
        return this.raw._link_prev != '';
    };

    /**
     * Get previous printers.
     * Updates this object with the new printers.
     * @returns {?Promise} - A Promise that will resolve to an array of printers.
     */
    Autodesk.Spark.Printers.prototype.prev =  function () {
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
     * Return true if the next printers link is valid.
     * @returns {boolean}
     */
    Autodesk.Spark.Printers.prototype.hasNext = function () {
        return this.raw._link_next != '';
    };

    /**
     * Get next printers.
     * Updates this object with the new printers.
     * @returns {?Promise} - A Promise that will resolve to an array of printers.
     */
    Autodesk.Spark.Printers.prototype.next = function () {
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

    Autodesk.Spark.Printers.prototype._parse = function (data) {
        this.clear();

        var printers = data.printers;
        if (Array.isArray(printers)) { // TODO: won't be necessary when api cleaned up
            var that = this;
            printers.forEach(function (printer) {
                that.push(new Spark.Printer(printer));
            });
        }

        this.raw = data;
    };

    Autodesk.Spark.Printer = function (data) {
        this.id = data.printer_id;
        this.name = data.printer_name;
        this.firmware = data.firmware;
        this.type_id = data.type_id;
        this.raw = data;
        this.status = null;
        return this;
    };

    /**
     * Register a printer to a member.
     * @param {String} code - Printer registration code.
     * @param {String} name - Printer nickname.
     * @returns {Promise} - A Promise that will resolve to a printer.
     */
    Autodesk.Spark.Printer.register = function (code, name) {
        return Client.authorizedApiRequest('/print/printers/register')
            .post(null, {registration_code: code, printer_name: name});

        // TODO: when api is fixed, this should resolve to new printer
        // TODO: until then, we could always call getById()
        //  .then(function (data) {
        //      return new Autodesk.Spark.Printer(data);
        //  });
    };

    /**
     * Get a registered printer.
     * @param {String} id - Printer id.
     * @returns {Promise} - A Promise that will resolve to a printer.
     */
    Autodesk.Spark.Printer.getById = function (id) {
        return Client.authorizedApiRequest('/print/printers/' + id)
            .get()
            .then(function (data) {
                return new Autodesk.Spark.Printer(data);
            });
    };

    Autodesk.Spark.Printer.prototype = {

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
         * This uses the results of the last call to getStatus().
         * @returns {boolean}
         */
        isOnline: function () {
            /// TODO: ep.com returns offline if printer didn't ping within 60 sec - no equivalent here?
            return this.status || this.raw.printer_last_health !== 'Offline';
        },

        /**
         * Return true if the printer is printing.
         * This uses the results of the last call to getStatus().
         * @returns {boolean}
         */
        isPrinting: function () {
            var state = (((this.status || {}).last_reported_state || {}).data || {}).state;
            return /^(?:Exposing|Printing|Separating)$/.test(state);
        },

        pause: function (job_id) {
            return this.sendCommand('pause', {job_id: job_id});
        },

        resume: function (job_id) {
            return this.sendCommand('resume', {job_id: job_id});
        },

        cancel: function (job_id) {
            return this.sendCommand('cancel', {job_id: job_id});
        },

        reset: function () {
            return this.sendCommand('reset');
        },

        calibrate: function () {
            return this.sendCommand('calibrate');
        },

        _kLatestFirmwareVersion: "1.1.20150219.0", // TODO: add to config

        needsFirmwareUpgrade: function () {
            if (this.firmware) {
                if (printerFrontend.Utils.versionCompare(this.firmware, _kLatestFirmwareVersion) === -1) {
                    return true;
                }
            }
            return false;
        },

        firmwareUpgrade: function (package_url) {
            return this.sendCommand('firmware_upgrade', {package_url: package_url});
        },

        log: function () {
            return this.sendCommand('log');
        },

        home: function () {
            return this.sendCommand('home');
        },

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
                .then(function (data) {
                    return this.waitForCommand(data.command, data.task_id, options);
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
                var timerId = window.setInterval(function () {
                    Client.authorizedApiRequest(url)
                        .get(params)
                        .then(function (data) {
                            var is_error = ((data || {}).data || {}).is_error;
                            if (is_error) {
                                window.clearInterval(timerId);
                                reject(new Error(data.error_message));

                            } else {
                                if (options.onProgress) {
                                    options.onProgress(data);
                                }

                                if (data && 1.0 <= data.progress) {
                                    window.clearInterval(timerId);
                                    resolve(data);

                                } else {
                                    var now = +new Date();
                                    if (timeout <= (now - start)) {
                                        window.clearInterval(timerId);
                                        reject(new Error('timeout'));
                                    }
                                }
                            }
                        })
                        .catch(function (error) {
                            window.clearInterval(timerId);
                            reject(error);
                        });
                }, freq);
            });
        },

        /**
         * Unregister a printer.
         * @returns {Promise} - A Promise that will resolve to ???.
         */
        unregister: function () {
            return Client.authorizedApiRequest('/print/printers/' + this.id)
                .delete()
        },

        getJobs: function () {
        },

        createJob: function () {
        },

        startJob: function () {
        }
    };

})();
