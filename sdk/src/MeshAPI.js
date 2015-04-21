var ADSKSpark = ADSKSpark || {};

(function() {
    var Client = ADSKSpark.Client;
    var _meshCounter = 0;

    var requestImport = function(fileId, name, generateVisual, transform)
    {
        ++_meshCounter;
        name = name || ("Mesh_" + _meshCounter);
        transform = transform || [
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0]
        ];
        var parms = {
            "file_id": fileId,
            "name": name,
            "transform": transform,
            "generate_visual": !!generateVisual
        };
        return Client.authorizedApiRequest('/meshes/import', parms).post();
    }

    var uploadFileObject = function(file, progressCallback)
    {
        var formData = new FormData();
        formData.append(file.name, file);
                
        // TODO: file upload progress ???
        return Client.authorizedApiRequest('/files/upload', formData).post();
    }

    // The Mesh API singleton.
    //
    ADSKSpark.MeshAPI = {
        /**
         */

        // progressCallback is optional
        importMesh: function(fileId, name, generateVisual, transform, progressCallback) {

            var waiter = new ADSKSpark.TaskWaiter(progressCallback);

            return requestImport(fileId, name, generateVisual, transform)
                    .then(waiter.wait);
        },

        // progressCallback is optional (not implemented yet)
        uploadFile: function(file, progressCallback) {
            return uploadFileObject(file, progressCallback);
        },

        transformMesh: function( meshId, transform ) {
            var payload = {
                id: meshId,
                transform: transform
            };
            return Client.authorizedApiRequest('meshes/transform', payload).post();
        },

        // progressCallback is optional
        analyzeMesh: function( meshId, progressCallback ) {
            var payload = {
                id: meshId
            };
            // TODO: It's possible to get immediate 200 response instead of 202 + task.
            var waiter = new ADSKSpark.TaskWaiter(progressCallback);
            return Client.authorizedApiRequest('meshes/analyze', payload).post()
                    .then(waiter.wait);
        },

        generateVisual: function( meshId, progressCallback ) {
            var payload = {
                id: meshId
            };
            // TODO: It's possible to get immediate 200 response instead of 202 + task.
            var waiter = new ADSKSpark.TaskWaiter(progressCallback);
            return Client.authorizedApiRequest('meshes/generateVisual', payload).post()
                    .then(waiter.wait);
        }

    };
}());
