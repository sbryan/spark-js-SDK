var ADSKSpark = ADSKSpark || {};

// NOTE: We may want to make this class private and not expose it to clients
// since some operations on it really should be done via the layout object.
// For example, you can't just transform one of these and expect the layout
// to update with the new position (unless we make these models aware of the
// layout they belong to). If we expose this in it's current state, it may 
// result in unexpected behaviour. So we probably should make the layout object
// the primary interface for all print prep work.

/**
 * This is the sdk interface to a Spark Mesh resource.
 *  @class
 *  @param {String} source - Path to local source file (currently obj or stl)
 *  @param {String} name - User visible name of this mesh object.
 *  @constructor
 */


ADSKSpark.PrintModel = function( source, name )
{
    var Client = ADSKSpark.Client;

    // A print model represents a single Spark Mesh resource and tracks
    // as much information as possible about this entity.
    //

    var _this = this;
    var _sourceModel = source;  // Source file path.
    var _name = name;
    var _error = null;
    var _fileInfo = null;
    var _meshData = null;
    var _importPromise = null;
    var _serial = 0;
    var _options = { 'reposition': true, 'reorient': true, 'support': true };

    function readFileData()
    {
        return new Promise(function(resolve, reject) {
            if( _fileInfo  === null )
            {
                var fileData = readfile(_sourceModel);
                _fileInfo = [fileData, _name];
                resolve(_fileInfo);
            }
            else
                resolve(_fileInfo);
        });
    }

    function uploadFile(result)
    {
        return new Promise(function(resolve, reject) {
            if( _fileInfo  === null )
            {
                var fileData = result[0];
                var fileName = result[1];
                // TODO: How to do multi-part form data upload?
                Client.authorizedApiRequest('files/upload/', fileData).post().then(function(response) {
                    _fileInfo = response.files[0];
                    resolve(_fileInfo);
                });
            }
            else
                resolve(_fileInfo);
        });
    }

    function importMesh(fileInfo)
    {
        return new Promise(function(resolve, reject) {
            var payload = {
                file_id: fileInfo.file_id,
                name: _name,
                transform: [
                    [1, 0, 0, 0],
                    [0, 1, 0, 0],
                    [0, 0, 1, 0]
                ]
            };
            Client.authorizedApiRequest('meshes/import/', payload).post().then(function(response) {
                _meshData = response;
                resolve(_meshData);  // Response is Spark Mesh data
            });
        });
    }

    function setMeshData(data)
    {
        // TODO Validate incoming data.
        _meshData = data;
        _serial++;
        // TODO send change event?
        return _this;
    }

    function setError(data)
    {
        _error = data;
        return data;
    }


    // Returns promise that resolves to this object.
	this.importMesh = function()
    {
        if( !_importPromise )
            _importPromise = readFileData().then(uploadFile).then(importMesh).then(setMeshData).catch(setError);

        return _importPromise;
    };


    // Do we need this???
	this.setName = function( name )
    {
        // If so, do we POST to meshes/rename and update the mesh data?
        _name = name;
    };


	this.getName = function()
    {
        return _name;
    };


	this.getId = function()
    {
        return _meshData ? _meshData.id : null;
    };


	this.setOptions = function( options )
    {
        _options.support    = !!options.support;
        _options.reposition = !!options.reposition;
        _options.reorient   = !!options.reorient;
    };


	this.getOptions = function()
    {
        return _options;
    };


	this.transform = function( transform )
    {
        // TODO: Check if the transform valid and is different.
        // TODO: Check if the mesh has been imported
        //
        return new Promise(function(resolve, reject) {
            var payload = {
                id: _meshData.id,
                transform: transform
            };
            Client.authorizedApiRequest('meshes/transform/', payload).post().then(function(response) {
                // Update model with new mesh data
                setMeshData(response.result);
            });
        });
    };


	this.analyze = function()
    {
        // Returns promise. May already be fulfilled if analyzed previously.
    };


	this.repair = function(all)
    {
        // Returns promise. On success _meshData is updated.
        // Consider: Track old mesh value and operation for undo/redo.
        // Consider: Always repair with generate_visual option true.
    };


	this.getVisual = function()
    {
        // Returns a promise to get the visual.
        // Note that operations like repair and PrintLayout.prepare may automatically
        // generate a visual, which means this promise may resolve immediately.
    };

	this.getSerialNumber = function()
    {
        // The serial number can be used to test for changes.
        // It gets incremented whenever the mesh is modified.
        return _serial;
    };


	this.updateMesh = function( meshData )
    {
        setMeshData(meshData);
    };
};
