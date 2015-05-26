/**
 * @namespace
 */
var ADSKSpark = ADSKSpark || {};

(function() {
    var Client = ADSKSpark.Client;
    var _meshCounter = 0;


    /**
     * @class ADSKSpark.TrayAPI
     * @description - ADSKSpark.TrayAPI is a singleton object providing interface methods for invoking the Tray related operations available
     * in the Spark REST API. There is no need to construct this object and its static methods can be invoked simply as: ADSKSpark.TrayAPI.methodName(...).
     * See reference - https://spark.autodesk.com/developers/reference/print
     */
    ADSKSpark.TrayAPI = {

        /**
         * @method createTray
         * @memberOf ADSKSpark.TrayAPI
         * @description - Create a new print Tray with mesh objects.
         * @param {string} printerTypeId - The Spark Id of the target printer type.
         * @param {string} printerProfileId - The Spark Id of the printer profile to be used.
         * @param {Array} meshIds - a list of Spark Mesh resource Id's specifying which meshes are to be printed.
         * @param {Object} [meshAttrs] - an optional map indexed by Mesh Id containing objects with boolean flag properties for tray preparation options. The three properties for each mesh all default to true: { "reposition": true, "reorient": true, "support": true } and indicate whether the corresponding mesh can be automatically positioned, reoriented and have supports generated.
         * @param {String} [defaultMaterialId] - The Spark Material resource Id to be used for this print. If not specified the default from the printer type definition will be used.
         * @param {Function} [progressCallback] - Optional function to be invoked when import progress updates are available. The function is passed a numeric value in the range [0, 1].
         *
         * @returns {Promise} - A Promise which resolves to a new Tray Resource Object.
         */
        createTray: function(printerTypeId, printerProfileId, meshIds, meshAttrs, defaultMaterialId, progressCallback) {

            var waiter = new ADSKSpark.TaskWaiter(progressCallback);

            var headers = {'Content-Type': 'application/json'};
            var payload = JSON.stringify({
                'printer_type_id': printerTypeId,
                'profile_id': printerProfileId,
                'mesh_ids': meshIds
            });
            if( meshAttrs )
                payload.mesh_attrs = meshAttrs;

            if( defaultMaterialId )
                payload.default_material_id = defaultMaterialId;
    
            return Client.authorizedApiRequest('/print/trays').post(headers, payload)
                    .then(waiter.wait);
        },

        /**
         * @method prepareTray
         * @memberOf ADSKSpark.TrayAPI
         * @description - Prepare a given tray for printing by possibly repairing, positioning, orienting and generating supports for all meshes in the Tray. This operation creates a new Tray resource and new Mesh resources for each of the modified meshes in the tray.
         * @param {String} trayId - The Id associated with an existing Spark Tray Resource.
         * @param {boolean} [generateVisual] - Optional flag requesting that a Bolt visualization file be generated for each of the new Mesh resources in the new tray.
         * @param {Function} [progressCallback] - Optional function to be invoked when import progress updates are available. The function is passed a numeric value in the range [0, 1].
         *
         * @returns {Promise} - A Promise which resolves to the new Tray Resource.
         */
        prepareTray: function(trayId, generateVisual, progressCallback) {
            var waiter = new ADSKSpark.TaskWaiter(progressCallback);

            var headers = {'Content-Type': 'application/json'};
            var payload = JSON.stringify({
                'id': trayId,
                'generate_visual': !!generateVisual
            });

            return Client.authorizedApiRequest('/print/trays/prepare').post(headers, payload)
                    .then(waiter.wait);
        },

        /**
         * @method generatePrintable
         * @memberOf ADSKSpark.TrayAPI
         * @description - Request the creation of a printable file from an existing Spark Tray resource. The specified tray must have been successfully prepared for this operation to succeed.
         * @param {String} trayId - The Id associated with an existing Spark Tray Resource.
         * @param {Function} [progressCallback] - Optional function to be invoked when import progress updates are available. The function is passed a numeric value in the range [0, 1].
         *
         * @returns {Promise} - A Promise which resolves to an object containing a Spark Drive "file_id" property.
         */
        generatePrintable: function(trayId, progressCallback) {
            var waiter = new ADSKSpark.TaskWaiter(progressCallback);

            var headers = {'Content-Type': 'application/json'};
            var payload = JSON.stringify({
                'id': trayId,
            });

            return Client.authorizedApiRequest('/print/trays/generatePrintable').post(headers, payload)
                    .then(waiter.wait);
        }

    };
}());
