describe('Mesh API tests', function() {
    'use strict';


    before(function() {
    });

    beforeEach(function() {
    });

    afterEach(function() {
    });

    it('Should exist', function(done) {
        var MeshApi = ADSKSpark.MeshAPI;

        Should.exist(MeshApi);

        MeshApi.should.be.Object.with.properties(['importMesh']);
        done();
    });

    it('Should import a mesh', function(done) {
        // TODO ...

        done();
    });

});
