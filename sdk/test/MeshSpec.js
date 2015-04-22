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

    it.only('Should fail importing a bogus mesh', function() {
        return MeshApi.importMesh('FUBAR_MESH_ID', 'NONAME')
            .then(function() {
                return Promise.reject(new Error('THIS SHOULD NOT HAVE WORKED'));
            }, function(err) {
                err.message.should.equal('404');
            });
    });

});
