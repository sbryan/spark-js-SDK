describe('Request', function() {
    'use strict';

    var ASR, xhr, requests;
    var testURL;

    before(function() {
        ASR = Autodesk.Spark.Request;
        testURL = 'http://localhost';
    });

    beforeEach(function() {
        xhr = sinon.useFakeXMLHttpRequest();
        requests = [];
        xhr.onCreate = function(request) {
            requests.push(request);
        };
    });

    afterEach(function() {
        xhr.restore();
    });

    it('Exists', function() {
        Should.exist(ASR);

        var request = ASR(testURL);

        Should.exist(request);
        request.should.be.Object.with.properties(['get', 'post', 'put', 'delete']);
    });

    context('GET', function() {
        it('Basic request', function(done) {
            var request = ASR(testURL);

            Should.exist(request);

            var promise = request.get();

            promise.should.be.instanceOf(Promise);

            // Check that a request was sent properly
            requests.length.should.equal(1);
            var fakeXhr = requests[0];
            fakeXhr.url.should.equal(testURL);
            fakeXhr.method.should.equal('GET');
            fakeXhr.requestHeaders.should.eql({
                'Content-Type': 'application/x-www-form-urlencoded'
            });
            Should(fakeXhr.requestBody).equal(null);

            // Fake a successful response
            fakeXhr.respond(200, {'Content-Type': 'application/json'}, JSON.stringify('Success!'));

            // Check the response
            promise.then(function(data) {
                Should(data).equal('Success!');
                done();
            }, function(error) {
                console.log(error.message);
            });
        });
    });

});
