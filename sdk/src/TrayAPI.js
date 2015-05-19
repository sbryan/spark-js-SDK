var ADSKSpark = ADSKSpark || {};

(function() {
    var Client = ADSKSpark.Client;
    var _meshCounter = 0;


    // The Tray API singleton.
    //
    ADSKSpark.TrayAPI = {

        // meshAttrs, defaultMaterialId, progressCallback are optional
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

        // generateVisual, progressCallback are optional
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

        // progressCallback is optional
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
