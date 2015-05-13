describe('Tray API tests', function() {
    'use strict';

    var TrayApi = ADSKSpark.TrayAPI,
        mockedAuthorizedRequest;

    before(function() {
        var Client = ADSKSpark.Client;
        mockedAuthorizedRequest = sinon.stub(Client, 'authorizedApiRequest');
    });

    beforeEach(function() {
        var testApiUrl = 'http://localhost:9998';
        ADSKSpark.Client.initialize(null, null, null, testApiUrl);
    });

    after(function(){
        mockedAuthorizedRequest.restore();
    });

    it('Should exist', function(done) {
        Should.exist(TrayApi);

        TrayApi.should.be.Object.with.properties(['createTray', 'prepareTray']);
        done();
    });

    it('Should fail creating a bogus tray', function(done) {
        //mock
        mockedAuthorizedRequest.withArgs('/print/trays').returns({
            post: function () {
                return Promise.reject({message:'400 error'});
            }
        });

        return TrayApi.createTray('BAD_PRINTER', 'BAD_PROFILE', ['BAD_MESH'])
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
