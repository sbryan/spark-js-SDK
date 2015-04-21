var ADSKSpark = ADSKSpark || {};

(function () {
    var Client = Autodesk.Spark.Client;


    /**
     * A paginated array of jobs.
     * @param {Object} data - JSON data.
     * @constructor
     */
    ADSKSpark.Jobs = function (data) {
        ADSKSpark.Paginated.call(this, data);
    };

    ADSKSpark.Jobs.prototype = Object.create(ADSKSpark.Paginated);
    ADSKSpark.Jobs.prototype.constructor = ADSKSpark.Jobs;

    ADSKSpark.Jobs.prototype._parse = function (data) {
        ADSKSpark.Paginated.prototype._parse.apply(this, data);

        var jobs = data.printer_jobs;
        if (Array.isArray(jobs)) {
            var that = this;
            jobs.forEach(function (job) {
                that.push(job);
            });
        }
    };

})();
