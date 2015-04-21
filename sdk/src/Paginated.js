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
    Spark.Paginated.prototype.prev = function () {
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

})();
