var Spark = Spark || {};

(function () {
    var Client = Autodesk.Spark.Client;


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

})();
