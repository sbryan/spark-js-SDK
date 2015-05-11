var ADSKSpark = ADSKSpark || {};

(function() {
    'use strict';

    var Client = ADSKSpark.Client;

    /**
     * @class
     * @type {{getFileDetails: Function, uploadFile: Function}}
     * @description - The Files API singleton.
     * See reference - https://spark.autodesk.com/developers/reference/drive?deeplink=%2Freference%2Ffiles
     */
    ADSKSpark.Files = {

        /**
         * Get the details for a specific file
         * @param {String} fileId - The ID of the file
         * @returns {Promise} - A promise that will resolve to an a file
         */
        getFileDetails: function (fileId) {

            //Make sure fileId is defined and that it is a number
            if (!isNaN(fileId)) {
                return Client.authorizedApiRequest('/files/' + fileId).get();
            }

            return Promise.reject(new Error('Proper fileId was not supplied'));
        },

        /**
         * Upload a file to Spark Drive
         * @param fileData - The file object to upload - has the form of:
         *                          file: The actual file data that is passed in the body
         *                          unzip: Should we treat the upload as a zip of multiple files
         *                          public: If it has full public URL for everyone's access
         * @returns {Promise} - A promise that will resolve to a file object response
         */
        uploadFile: function (fileData) {

            var fd = new FormData();
            fd.append("file", fileData.file);

            var unzip = fileData.unzip ? fileData.unzip : false;
            fd.append("unzip", unzip);

            if (fileData.public) {
                fd.append("public", fileData.public);
            }
            return Client.authorizedApiRequest('/files/upload').post(null, fd);

        },
    };

}());