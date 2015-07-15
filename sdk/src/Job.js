var ADSKSpark = ADSKSpark || {};

(function () {
    'use strict';

    var Client = ADSKSpark.Client;

    /**
     * A paginated array of jobs.
     * @param {Object} data - JSON data.
     * @constructor
     */
    ADSKSpark.Jobs = function (data) {
        ADSKSpark.Paginated.call(this, data);
    };

    ADSKSpark.Jobs.prototype = Object.create(ADSKSpark.Paginated.prototype);
    ADSKSpark.Jobs.prototype.constructor = ADSKSpark.Jobs;

    /**
     * Get jobs registered to a member.
     * @param {Object} [headers] - Optional list of request header properties.
     * @param {Object} [params] - limit/offset/sort/filter options.
     * @returns {Promise} - A promise that will resolve to an array of jobs.
     */
    ADSKSpark.Jobs.get = function (headers, params) {
        return Client.authorizedApiRequest('/print/jobs')
            .get(headers, params)
            .then(function (data) {
                return new ADSKSpark.Jobs(data);
            });
    };

    /**
     * Get jobs registered to a printer.
     * @param {String} printerId - Spark Printer Id.
     * @param {Object} [headers] - Optional list of request header properties.
     * @param {Object} [params] - limit/offset/sort/filter options.
     * @returns {Promise} - A promise that will resolve to an array of jobs.
     */
    ADSKSpark.Jobs.getPrinter = function (printerId, headers, params) {
        return Client.authorizedApiRequest('/print/printers/' + printerId + '/jobs')
            .get(headers, params)
            .then(function (data) {
                return new ADSKSpark.Jobs(data);
            });
    };

    ADSKSpark.Jobs.prototype.parse = function (data) {
        ADSKSpark.Paginated.prototype.parse.call(this, data);
        if (data) {
            var jobs = data.jobs || data.printer_jobs;
            if (Array.isArray(jobs)) {
                var _this = this;
                jobs.forEach(function (job) {
                    if (!job.printer_id) {
                        job.printer_id = data.printer_id;
                    }
                    if (!job.member_id) {
                        job.member_id = data.member_id;
                    }
                    _this.push(new ADSKSpark.Job(job));
                });
            }
        }
    };

    /**
     * A print job.
     * @param {Object} [data] - JSON data returned from Job status or list query. If omitted an empty Job object is constructed which can subsequently be used to invoke the "create" method.
     * @constructor
     */
    ADSKSpark.Job = function (data) {
        this.status = null;
        this.progress = 0.0;

        if (data) {
            this.id = data.job_id;
            this.printer_id = data.printer_id;
            this.status = data.job_status ? data.job_status.job_status : null;
            this.progress = data.job_status ? data.job_status.job_progress : 0.0;
            this.data = data;
        }
    };

    ADSKSpark.Job.prototype = {

        constructor: ADSKSpark.Job,

        /**
         * Get the status of a print job.
         * @returns {Promise} - A Promise that will resolve to this object with updated status information.
         */
        getStatus: function () {
            if (!this.id) {
                return Promise.reject(new Error('Job does not exist.'));
            }

            var _this = this;
            return Client.authorizedApiRequest('/print/jobs/' + this.id)
                .get()
                .then(function (data) {
                    // Service will soon include the printer_id.
                    if (data.hasOwnProperty('printer_id')) {
                        _this.printer_id = data.printer_id;
                    }

                    _this.status = data.job_status ? data.job_status.job_status : null;
                    _this.progress = data.job_status ? data.job_status.job_progress : 0.0;
                    _this.data = data;
                    return _this;
                })
                .catch(function (error) {
                    _this.status = null;
                    throw error;            // Propagate error.
                });
        },

        /**
         * Create a new print job. Note, this may also send it immediately to the printer.
         * @param {string} profileId - Spark Printer Profile Id to be used for this print job.
         * @param {string} [printerId] - Spark Id of the target printer.
         * @param {string} [printableId] - Spark Drive Id of the printable file.
         * @returns {Promise} - A Promise which resolves to this object with updated contents.
         * @see {@link ADSKSpark.TrayAPI.generatePrintable}
         */
        createWithProfile: function (profileId, printerId, printableId) {
            return this.createWithSettings({profile_id: profileId}, printerId, printableId);
        },

        /**
         * Create a new print job. Note, this may also send it immediately to the printer.
         * @param {Object} settings - Settings to be used for this print job.
         * @param {string} [printerId] - Spark Id of the target printer.
         * @param {string} [printableId] - Spark Drive Id of the printable file.
         * @returns {Promise} - A Promise which resolves to this object with updated contents.
         * @see {@link ADSKSpark.TrayAPI.generatePrintable}
         */
        createWithSettings: function (settings, printerId, printableId) {
            if (this.id) {
                return Promise.reject(new Error('Job already exists.'));
            }

            var _this = this;

            function updateJob(data) {
                _this.id = data.job_id;
                return _this.getStatus();
            }

            printerId = printerId || 0;
            var headers = {'Content-Type': 'application/json'};
            var payload = {settings: settings};
            if (printableId) {
                payload.printable_id = printableId;
            }
            return Client.authorizedApiRequest('/print/printers/' + printerId + '/jobs')
                .post(headers, JSON.stringify(payload))
                .then(updateJob);
        },

        /**
         * Update the job status and/or comment and/or custom data for this job.
         * @param {string} [newStatus] - job status string. Must be either "success" or "failed".
         * @param {string} [newComment] - comment string
         * @param {object} [customData] - custom application data to be saved with this job.
         * @returns {Promise} - A Promise which resolves to this object with updated contents.
         */
        updateStatus: function (newStatus, newComment, customData) {
            if (!this.id) {
                return Promise.reject(new Error('Unknown job in updateStatus.'));
            }
            if (newStatus) {
                newStatus = newStatus.toLowerCase();
                if (newStatus !== 'success' && newStatus !== 'failed') {
                    return Promise.reject(new Error('Invalid job status in updateStatus.'));
                }
            }
            var _this = this;
            var urlStatus = encodeURIComponent(newStatus || '');
            var urlComment = encodeURIComponent(newComment || '');
            var headers, payload;
            if (customData) {
                headers = {'Content-Type': 'application/json'};
                payload = JSON.stringify(customData);
            }
            return Client.authorizedApiRequest('/print/jobs/' + this.id + '?status=' + urlStatus + '&comment=' + urlComment)
                .put(headers, payload)
                .then(function (response) {
                    console.log('updateStatus GOT: ' + JSON.stringify(response));
                    return _this.getStatus();
                });
        },

        /**
         * Set the printable file on a job that doesn't already have one.
         * @param {string} [printableId] - Spark Drive Id of the printable file.
         * @returns {Promise} - A Promise which resolves to this object with updated contents.
         */
        setPrintable: function (printableId) {
            if (!this.id) {
                return Promise.reject(new Error('Unknown job in setPrintable.'));
            }

            if (!printableId) {
                return Promise.reject(new Error('Must provide printable file ID for setPrintable.'));
            }

            var _this = this;
            var headers = {'Content-Type': 'application/json'};
            var payload = JSON.stringify({
                'printable_id': printableId
            });

            return Client.authorizedApiRequest('/print/jobs/' + this.id + '/printable')
                .post(headers, payload)
                .then(function (response) {
                    if (response.printer_id) {
                        _this.printer_id = response.printer_id;
                    }
                    if (response.status) {
                        _this.status = response.status;
                    }

                    console.log('setPrintable GOT: ' + JSON.stringify(response));
                    return _this.getStatus();
                });
        },

        /**
         * Set the printer on a job that doesn't already have one.
         * @param {string} [printerId] - Printer to assign this job to.
         * @returns {Promise} - A Promise which resolves to this object with updated contents.
         */
        setPrinter: function (printerId) {
            if (!this.id) {
                return Promise.reject(new Error('Unknown job in setPrinter.'));
            }

            if (!printerId) {
                return Promise.reject(new Error('Must provide printer for setPrinter.'));
            }

            var _this = this;
            var headers = {'Content-Type': 'application/json'};
            var payload = JSON.stringify({
                'printer_id': printerId
            });

            return Client.authorizedApiRequest('/print/jobs/' + this.id + '/printer')
                .post(headers, payload)
                .then(function (response) {
                    if (response.printer_id) {
                        _this.printer_id = response.printer_id;
                    }
                    if (response.status) {
                        _this.status = response.status;
                    }

                    console.log('setPrinter GOT: ' + JSON.stringify(response));
                    return _this.getStatus();
                });
        },

        /**
         * Set a callback for a print job.
         * @param {string} callbackUrl
         * @returns {Promise}
         */
        setCallback: function (callbackUrl) {
            return Client.authorizedApiRequest('/print/jobs/' + this.id + '/register')
                .post(null, {callback_url: callbackUrl});
        },

        /**
         * Set the custom data for this job.
         * @param {object} customData - custom application data to be saved with this job.
         * @returns {Promise} - A Promise which resolves to this object with updated contents.
         */
        updateCustomData: function (customData) {
            if (!this.id) {
                return Promise.reject(new Error('Unknown job in updateCustomData.'));
            }
            if (!customData) {
                return Promise.reject(new Error('Custom data required for updateCustomData.'));
            }
            var _this = this;
            var headers = {'Content-Type': 'application/json'};
            var payload = JSON.stringify(customData);

            return Client.authorizedApiRequest('/print/jobs/' + this.id)
                .put(headers, payload)
                .then(function (response) {
                    console.log('updateCustomData GOT: ' + JSON.stringify(response));
                    return _this.getStatus();
                });
        },

        /**
         * Set the source tray for this job. The tray Id provided is saved with the job
         * custom data in the property "ADSKSpark.source_tray". Although not required
         * for the print job, applications should use this field to keep track of which
         * tray was used to create this job. This call will overwrite any previously
         * set value for this field.
         * @param {String} [trayId] - The Spark Id of the Tray used to create the printable
         * for this job.
         * @returns {Promise} - A Promise which resolves to this object with updated contents.
         */
        setSourceTray: function (trayId) {
            if (!this.id) {
                return Promise.reject(new Error('Unknown job in setSourceTray.'));
            }
            if (!this.data.job_custom_data) {
                this.data.job_custom_data = {};
            }
            if (!this.data.job_custom_data.ADSKSpark) {
                this.data.job_custom_data.ADSKSpark = {};
            }
            this.data.job_custom_data.ADSKSpark.source_tray = trayId;

            return this.updateCustomData(this.data.job_custom_data);
        },

        /**
         * Get the source tray for this job.
         * @returns {String} - The previously saved source tray Id for this Job, if any.
         * Returns null if not set.
         */
        getSourceTray: function () {
            var custom = this.data.job_custom_data;
            if (custom && custom.ADSKSpark) {
                return custom.ADSKSpark.source_tray;
            }
            return null;
        },

        /**
         * Set the list of source meshes for this job. This is a list of user defined
         * filenames that were originally used to create this job. Filenames are saved
         * with the job custom data in the property 'ADSKSpark.source_files'. Although
         * not required, applications should use this list to keep track of the user
         * files imported for this job. This call will overwrite any previously set
         * value for this field.
         * @param {Array} [meshPaths] - List of user paths or filenames.
         * @returns {Promise} - A Promise which resolves to this object with updated contents.
         */
        setMeshPaths: function (meshPaths) {
            if (!this.id) {
                return Promise.reject(new Error('Unknown job in setMeshPaths.'));
            }
            if (!meshPaths) {
                meshPaths = [];
            }
            if (!this.data.job_custom_data) {
                this.data.job_custom_data = {};
            }
            if (!this.data.job_custom_data.ADSKSpark) {
                this.data.job_custom_data.ADSKSpark = {};
            }
            this.data.job_custom_data.ADSKSpark.source_files = meshPaths;

            return this.updateCustomData(this.data.job_custom_data);
        },

        /**
         * Get the source mesh list for this job.
         * @returns {Array} - The previously saved list of source mesh paths for this Job,
         * if any.
         */
        getMeshPaths: function () {
            var custom = this.data.job_custom_data;
            if (custom && custom.ADSKSpark) {
                return custom.ADSKSpark.source_files;
            }
            return [];
        }
    };

}());
