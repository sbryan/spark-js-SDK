describe('Mesh API tests', function() {
    'use strict';

    var MeshApi = ADSKSpark.MeshAPI;


    before(function() {
    });

    beforeEach(function() {
    });

    afterEach(function() {
    });

    it('Should exist', function(done) {
        Should.exist(MeshApi);

        MeshApi.should.be.Object.with.properties(['importMesh']);
        done();
    });

    it('Should fail importing a bogus mesh', function(done) {

        MeshApi.importMesh("FUBAR_MESH_ID", "NONAME")
            .then(function() {
                done("THIS SHOULD NOT HAVE WORKED");
            })
            .catch(function(err) {
                err.message.should.equal('404 NOT FOUND');
                done();
            });
    });

});
