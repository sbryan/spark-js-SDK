var ADSKSpark = ADSKSpark || {};

(function() {
    var Client = ADSKSpark.Client;
    var _meshCounter = 0;

    var requestImport = function(fileId, name, generateVisual, transform, waiter)
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
        var importPromise = Client.authorizedApiRequest('/meshes/import', parms).post();

        if( waiter )
            importPromise.then(waiter.wait);

        return importPromise;
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
        importMesh: function(fileId, name, generateVisual, transform, progressCallback) {
            var waiter = progressCallback ? new ADSKSpark.TaskWaiter(progressCallback) : null;
            return requestImport(fileId, name, generateVisual, transform, waiter);
        },

        uploadFile: function(file, progressCallback) {
            return uploadFileObject(file, progressCallback);
        },
    };
}());
