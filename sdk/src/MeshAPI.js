var ADSKSpark = ADSKSpark || {};

(function() {
    var Client = ADSKSpark.Client;
    var _meshCounter = 0;

    // The Mesh API singleton.
    //
    ADSKSpark.MeshAPI = {
        /**
         */
        importMesh: function(fileId, name, transform, progressCallback) {
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
                "transform": transform
            };
            var waiter = new ADSKSpark.TaskWaiter(progressCallback);

            return Client.authorizedApiRequest('/meshes/import', parms)
                .post().then(waiter.wait);
        }

    };
}());
