describe('Mesh API tests', function() {
    'use strict';

    var MeshApi = ADSKSpark.MeshAPI,
        mockedAuthorizedRequest;


    before(function() {
        var Client = ADSKSpark.Client;
        mockedAuthorizedRequest = sinon.stub(Client, 'authorizedApiRequest');
    });

    beforeEach(function() {
        var testApiUrl = 'http://localhost:9998';
        ADSKSpark.Client.initialize(null, null, null, null, testApiUrl);
    });

    after(function(){
        mockedAuthorizedRequest.restore();
    });

    it('Should exist', function(done) {
        Should.exist(MeshApi);

        MeshApi.should.be.Object.with.properties(['importMesh']);
        done();
    });

    it('Should fail importing a bogus mesh', function(done) {
        //mock
        mockedAuthorizedRequest.withArgs('/geom/meshes/import').returns({
            post: function () {
                return Q.reject({message:'400 error'});
            }
        });

        return MeshApi.importMesh('FUBAR_MESH_ID', 'NONAME')
            .then(function() {
                done(new Error('THIS SHOULD NOT HAVE WORKED'));
            })
            .catch(function(err) {
                expect(err).to.have.property('message');
                expect(err.message).to.have.string('400');
                done(); // Correct result!!
            })
            // Catch should failures:
            .catch(function(fail) {
                done(fail);
            });
    });

});
