var ADSKSpark = ADSKSpark || {};

(function () {
    var Client = ADSKSpark.Client;

    /**
     * A base class for paginated arrays of items.
     * @param {Object} data - JSON data.
     * @constructor
     */
    ADSKSpark.Paginated = function (data) {
        this._parse(data);
    };

    ADSKSpark.Paginated.prototype = Object.create(Array.prototype); // Almost-array
    ADSKSpark.Paginated.prototype.constructor = ADSKSpark.Paginated;

    ADSKSpark.Paginated.prototype._parse = function (data) {
        this.clear();
        this.raw = data;
    };

    /**
     * Return true if the previous link is valid.
     * @returns {boolean}
     */
    ADSKSpark.Paginated.prototype.hasPrev = function () {
        return this.raw._link_prev != '';
    };

    /**
     * Get previous items.
     * Updates this object with the new items.
     * @returns {?Promise} - A Promise that will resolve to an array of items.
     */
    ADSKSpark.Paginated.prototype.prev = function () {
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
    ADSKSpark.Paginated.prototype.hasNext = function () {
        return this.raw._link_next != '';
    };

    /**
     * Get next items.
     * Updates this object with the new items.
     * @returns {?Promise} - A Promise that will resolve to an array of items.
     */
    ADSKSpark.Paginated.prototype.next = function () {
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
