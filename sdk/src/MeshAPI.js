/**
 * @namespace
 */
var ADSKSpark = ADSKSpark || {};

(function () {
    'use strict';

    var Client = ADSKSpark.Client;
    var _meshCounter = 0;

    var requestImport = function (fileId, name, generateVisual, transform) {
        ++_meshCounter;
        name = name || ('Mesh_' + _meshCounter);
        transform = transform || [
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0]
        ];
        var headers = {'Content-Type': 'application/json'};
        var payload = JSON.stringify({
            'file_id': fileId.toString(),
            'name': name,
            'transform': transform,
            'generate_visual': !!generateVisual
        });
        return Client.authorizedApiRequest('/geom/meshes/import').post(headers, payload);
    };

    var uploadFileObject = function (file) {
        var formData = new FormData();
        formData.append(file.name, file);

        // TODO: file upload progress ???
        return Client.authorizedApiRequest('/files/upload').post(null, formData);
    };

    /**
     * @class ADSKSpark.MeshAPI
     * @description - ADSKSpark.MeshAPI is a singleton object providing interface methods for invoking the Mesh related operations available
     * in the Spark REST API. There is no need to construct this object and its static methods can be invoked simply as: ADSKSpark.MeshAPI.methodName(...).
     * See reference - https://spark.autodesk.com/developers/reference/print
     */
    ADSKSpark.MeshAPI = {

        /**
         * @method importMesh
         * @memberOf ADSKSpark.MeshAPI
         * @description - Convert a previously uploaded file to a Spark Mesh Resource.
         * Input files must be converted to mesh objects in order to analyze
         * and prepare them for printing.
         * @param {number} fileId - The Spark Drive Id of the previously uploaded data file.
         * @param {string} name - A user defined name for this mesh resource.
         * @param {boolean} [generateVisual] - Optional flag requesting that a Bolt file be generated for visualization purposes.
         * @param {Array} [transform] - Optional transform to be applied to this mesh. This should be an array containing the three rows of an affine transformation. The default value is the identity transform: [ [ 1, 0, 0, 0 ], [ 0, 1, 0, 0 ], [ 0, 0, 1, 0 ] ].
         * @param {Function} [progressCallback] - Optional function to be invoked when import progress updates are available. The function is passed a numeric value in the range [0, 1].
         *
         * @returns {Promise} - A Promise which resolves to a Mesh Resource Object.
         */
        importMesh: function (fileId, name, generateVisual, transform, progressCallback) {
            var waiter = new ADSKSpark.TaskWaiter(progressCallback);

            return requestImport(fileId, name, generateVisual, transform)
                .then(waiter.wait);
        },

        /**
         * @method uploadFile
         * @memberOf ADSKSpark.MeshAPI
         * @description -  A convenience interface to the Spark Drive upload mechanism for uploading a single file.
         * @param {Object} file - A single file upload object from a DOM FileUpload list.
         * @param {Function} [progressCallback] - Optional function to be invoked when import progress updates are available. The function is passed a numeric value in the range [0, 1].
         *
         * @returns {Promise} - A Promise which resolves to a list of file upload results. The first entry in the resulting list should be the File resource information for this upload. See https://spark.autodesk.com/developers/reference/drive
         */
        uploadFile: function (file, progressCallback) {
            return uploadFileObject(file, progressCallback);
        },

        /**
         * @method transformMesh
         * @memberOf ADSKSpark.MeshAPI
         * @description - Modify the transform applied to a Spark Mesh Resource.
         * @param meshId
         * @param {Array} transform - Optional transform to be applied to this mesh. This should be an array containing the three rows of an affine transformation. The default value is the identity transform: [ [ 1, 0, 0, 0 ], [ 0, 1, 0, 0 ], [ 0, 0, 1, 0 ] ].
         *
         * @returns {Object} - A new Spark Mesh Resource with the modified transform.
         */
        transformMesh: function (meshId, transform) {
            // TODO: This needs generateVisual option (even though transforms are not applied to visuals).
            var headers = {'Content-Type': 'application/json'};
            var payload = JSON.stringify({
                id: meshId,
                transform: transform
            });
            return Client.authorizedApiRequest('/geom/meshes/transform').post(headers, payload);
        },

        /**
         * @method analyzeMesh
         * @memberOf ADSKSpark.MeshAPI
         * @description - Perform a printable analysis on a given Spark Mesh Resource.
         * @param {String} meshId - The Id associated with an existing Spark Mesh Resource.
         * @param {Function} [progressCallback] - Optional function to be invoked when import progress updates are available. The function is passed a numeric value in the range [0, 1].
         *
         * @returns {Promise} - A Promise which resolves to the input Mesh Resource with analysis results available in the "problems" property. See https://spark.autodesk.com/developers/reference/print
         */
        analyzeMesh: function (meshId, progressCallback) {
            var headers = {'Content-Type': 'application/json'};
            var payload = JSON.stringify({
                id: meshId
            });
            var waiter = new ADSKSpark.TaskWaiter(progressCallback);
            return Client.authorizedApiRequest('/geom/meshes/analyze').post(headers, payload)
                .then(waiter.wait);
        },


	    /**
	     * @method repairMesh
	     * @memberOf ADSKSpark.MeshAPI
	     * @description - Perform all possible mesh repair operations on a given Spark Mesh Resource.
	     * @param {String} meshId - The Id associated with an existing Spark Mesh Resource.
	     * @param {boolean} [isRepairAll] - Optional flag. If false - will repair only one problem at a time. default: true.
	     * @param {boolean} [generateVisual] - Optional flag requesting that a Bolt file be generated for visualization purposes.
	     * @param {Function} [progressCallback] - Optional function to be invoked when import progress updates are available. The function is passed a numeric value in the range [0, 1].
	     *
	     * @returns {Promise} - A Promise which resolves to a new Mesh Resource with possible repairs applied. See https://spark.autodesk.com/developers/reference/print
	     */
	    repairMesh: function (meshId, isRepairAll,generateVisual, progressCallback) {
		    var headers = {'Content-Type': 'application/json'};

		    if(isRepairAll === undefined){
			    isRepairAll = true;
		    }

		    var payload = JSON.stringify({
			    id: meshId,
			    all: isRepairAll,
			    generate_visual: !!generateVisual
		    });
		    var waiter = new ADSKSpark.TaskWaiter(progressCallback);
		    return Client.authorizedApiRequest('/geom/meshes/repair').post(headers, payload)
			    .then(waiter.wait);
	    },

	    /**
	     * @method generateVisual
	     * @memberOf ADSKSpark.MeshAPI
	     * @description - Request the generation of a Bolt visualization file for a given Spark Mesh Resource.
	     * @param {String} meshId - The Id associated with an existing Spark Mesh Resource.
	     * @param {Function} [progressCallback] - Optional function to be invoked when import progress updates are available. The function is passed a numeric value in the range [0, 1].
	     *
	     * @returns {Promise} - A Promise which resolves to the input Mesh Resource with a visual_file_id property added.
	     */
	    generateVisual: function (meshId, progressCallback) {
		    var headers = {'Content-Type': 'application/json'};
		    var payload = JSON.stringify({
			    id: meshId
		    });
		    var waiter = new ADSKSpark.TaskWaiter(progressCallback);
		    return Client.authorizedApiRequest('/geom/meshes/generateVisual').post(headers, payload)
			    .then(waiter.wait);
	    },


	    /**
	     * @method exportMesh
	     * @memberOf ADSKSpark.MeshAPI
	     * @description exports Mesh and eventually returns a downloadable fileId
	     * @param meshId - The Id associated with an existing Spark Mesh Resource.
	     * @param fileType - The type of the export file: obj (Wavefront OBJ), stl_ascii (ASCII STL) or stl_binary (binary STL). default stl_ascii
	     * @param progressCallback - Optional function to be invoked when import progress updates are available. The function is passed a numeric value in the range [0, 1].
	     *
	     * @returns {Promise} - Promise which resolves to a file_id for downloading.
	     */
	    exportMesh: function (meshId, fileType, progressCallback) {

		    fileType = fileType || "stl_ascii";

		    var headers = {'Content-Type': 'application/json'};
		    var payload = JSON.stringify({
			    id: meshId,
			    file_type: fileType
		    });
		    var waiter = new ADSKSpark.TaskWaiter(progressCallback);
		    return Client.authorizedApiRequest('/geom/meshes/export').post(headers, payload)
			    .then(waiter.wait);
	    }
    };

}());
