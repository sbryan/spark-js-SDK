describe('Client', function() {
    'use strict';

    var ASC, xhr, requests;
    var testGuestUrl, testAccessUrl, testApiUrl;

    before(function() {
        ASC = ADSKSpark.Client;
        testGuestUrl = 'http://localhost/guest';
        testAccessUrl = 'http://localhost/access';
        testApiUrl = 'https://localhost';
    });

    beforeEach(function() {
        localStorage.clear(); // Clear any tokens that were stored by the client

        xhr = sinon.useFakeXMLHttpRequest();
        requests = [];
        xhr.onCreate = function(request) {
            requests.push(request);
        };
    });

    afterEach(function() {
        xhr.restore();
    });

    it('should exist', function() {
        Should.exist(ASC);

        ASC.should.be.Object.with.properties(['initialize', 'getGuestToken']);
    });

    it('should get guest token', function(done) {
        ASC.initialize('this is not an ID', testGuestUrl, testAccessUrl, testApiUrl);

        requests.length.should.equal(0);

        var promise = ASC.getGuestToken();

        promise.should.be.instanceOf(Promise);

        // Make sure a request was sent
        requests.length.should.equal(1);
        var xhr = requests[0];
        xhr.url.should.equal(testGuestUrl);
        xhr.method.should.equal('GET');

        // Respond with fake token
        var fakeGuestToken = {
            access_token: 'this is a fake token',
            expires_in: 10000
        };
        xhr.respond(200, {'Content-Type': 'application/json'}, JSON.stringify(fakeGuestToken));

        // Check promise
        promise.then(function(data) {
            var guestToken = data;

            Should.exist(guestToken);

            // Should be able to get the same token again without a request being sent
            var secondPromise = ASC.getGuestToken();

            requests.length.should.equal(1);

            secondPromise.then(function(data) {
                guestToken.should.equal(data);
                done();
            }, function(error) {
                done(new Error('The second promise was rejected. ' + error.message));
            });
        }, function(error) {
            done(new Error('Promise was rejected. ' + error.message));
        });
    });

});
