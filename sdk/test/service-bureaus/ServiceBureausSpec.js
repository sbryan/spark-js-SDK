describe('ServiceBureaus', function () {
	'use strict';

	var ServiceBureaus,Client, mockedAuthorizedRequest, mockedAccessTokenIsValid, fakeServiceBureausGetResponse, fakeSparkMaterialsGetResponse, fakeQuickQuotesGetResponse, fakeCartUrlGetResponse;


	before(function () {
		ServiceBureaus = ADSKSpark.ServiceBureaus;
		Client = ADSKSpark.Client;
		mockedAuthorizedRequest = sinon.stub(Client, 'authorizedApiRequest');
		mockedAccessTokenIsValid = sinon.stub(Client,'isAccessTokenValid');
	});

	after(function(){
		mockedAuthorizedRequest.restore();
		mockedAccessTokenIsValid.restore();
	});

	beforeEach(function () {

		var getServiceBureausJSON = __html__['test/mocks/getServiceBureaus.json'],
		getSparkMaterialsJSON = __html__['test/mocks/getSparkMaterials.json'],
	    getQuickQuotesJSON = __html__['test/mocks/getQuickQuotes.json'],
	    getCartUrlJSON  = __html__['test/mocks/getCartUrl.json'];

		fakeServiceBureausGetResponse = JSON.parse(getServiceBureausJSON);
		fakeSparkMaterialsGetResponse = JSON.parse(getSparkMaterialsJSON);
		fakeQuickQuotesGetResponse =  JSON.parse(getQuickQuotesJSON);
		fakeCartUrlGetResponse = JSON.parse(getCartUrlJSON);
	});

	it('should exist', function () {
		expect(ServiceBureaus).to.exist;
		expect(ServiceBureaus).to.have.property('getServiceBureaus');
		expect(ServiceBureaus).to.have.property('getSparkMaterials');
		expect(ServiceBureaus).to.have.property('getQuotes');
		expect(ServiceBureaus).to.have.property('getCartUrl');
	});


	it('should get service bureaus successfully', function () {

		//mock
		mockedAuthorizedRequest.withArgs('/servicebureaus').returns({
			get: function () {
				return Promise.resolve(fakeServiceBureausGetResponse);
			}
		});

		return ServiceBureaus.getServiceBureaus().then(function (response) {
			expect(response[0]).to.have.property('id', fakeServiceBureausGetResponse[0].id);
			expect(response[0]).to.have.property('name', fakeServiceBureausGetResponse[0].name);
			expect(response[0]).to.have.property('logoUrl', fakeServiceBureausGetResponse[0].logoUrl);
			expect(response[0]).to.have.property('websiteUrl', fakeServiceBureausGetResponse[0].websiteUrl);
		});

	});

	it('should get materials successfully', function () {

		//mock
		mockedAuthorizedRequest.withArgs('/servicebureaus/materials').returns({
			get: function () {
				return Promise.resolve(fakeSparkMaterialsGetResponse);
			}
		});

		return ServiceBureaus.getSparkMaterials().then(function (response) {
			expect(response[0]).to.have.property('id', fakeSparkMaterialsGetResponse[0].id);
			expect(response[0]).to.have.property('name', fakeSparkMaterialsGetResponse[0].name);
		});

	});

	it('should get quick quotes successfully', function () {

		//mock
		mockedAuthorizedRequest.withArgs('/servicebureaus/quickquotes').returns({
			post: function () {
				return Promise.resolve(fakeQuickQuotesGetResponse);
			}
		});

        var data = JSON.stringify({ 'items': [ {'material_id': "1234",'files': [{"file_id":"12345"}]}] });

		return ServiceBureaus.getQuotes(data).then(function (response) {
			expect(response.quotes[0]).to.have.property('success', fakeQuickQuotesGetResponse.quotes[0].success);
			expect(response.quotes[0]).to.have.property('service_bureau_id', fakeQuickQuotesGetResponse.quotes[0].service_bureau_id);
			expect(response.quotes[0]).to.have.property('material_id', fakeQuickQuotesGetResponse.quotes[0].material_id);
			expect(response.quotes[0]).to.have.property('file_id', fakeQuickQuotesGetResponse.quotes[0].file_id);
			expect(response.quotes[0]).to.have.property('price', fakeQuickQuotesGetResponse.quotes[0].price);
		});

	});

    it('should reject getQuotes if items object is undefined', function () {
        return ServiceBureaus
            .getQuotes()
            .then(function (response) {
            })
            .catch(function (error) {
                expect(error).to.be.an.instanceof(Object);
                expect(error).to.have.property('message');
            });

    });

    it('should reject getQuotes if items object is empty', function () {

        var data = JSON.stringify({ 'items': [ ] });

        return ServiceBureaus
            .getQuotes(data)
            .then(function (response) {
            })
            .catch(function (error) {
                expect(error).to.be.an.instanceof(Object);
                expect(error).to.have.property('message');
            });

    });


	it('should get cart url successfully', function () {

		//mock
		mockedAuthorizedRequest.withArgs('/servicebureaus/12345/submit').returns({
			post: function () {
				return Promise.resolve(fakeCartUrlGetResponse);
			}
		});

        var data = JSON.stringify({ 'models' : [ {'file_id' : "12344", 'file_name' : "file.stl", 'quantity':1} ] });

		return ServiceBureaus.getCartUrl("12345", data).then(function (response) {
			expect(response.urls[0]).to.have.property('url', fakeCartUrlGetResponse.urls[0].url);
			expect(response.urls[0]).to.have.property('file_ids', fakeCartUrlGetResponse.urls[0].file_ids);

		});

	});

    it('should reject getCartUrl if models object and serviceBureauId are undefined', function () {
        return ServiceBureaus
            .getCartUrl()
            .then(function (response) {
            })
            .catch(function (error) {
                expect(error).to.be.an.instanceof(Object);
                expect(error).to.have.property('message');
            });

    });

    it('should reject getCartUrl if models object is empty', function () {

        var data = JSON.stringify({ 'models' : [ ] });

        return ServiceBureaus
            .getCartUrl("1234", data)
            .then(function (response) {
            })
            .catch(function (error) {
                expect(error).to.be.an.instanceof(Object);
                expect(error).to.have.property('message');
            });

    });

    it('should reject getCartUrl if serviceBureauId is empty', function () {

        var data = JSON.stringify({ 'models' : [ ] });

        return ServiceBureaus
            .getCartUrl("", data)
            .then(function (response) {
            })
            .catch(function (error) {
                expect(error).to.be.an.instanceof(Object);
                expect(error).to.have.property('message');
            });

    });
});
