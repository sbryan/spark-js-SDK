describe('Assets', function () {
	'use strict';

	var Assets, mockedAuthorizedRequest, mockedGuestAuthorizedRequest,
		fakeAssetGetResponse, fakeAssetsGetResponse, fakeAssetCreateResponse, fakeAssetUpdateResponse;

	before(function () {
		Assets = ADSKSpark.Assets;
		var Client = ADSKSpark.Client;
		mockedAuthorizedRequest = sinon.stub(Client, 'authorizedApiRequest');
		mockedGuestAuthorizedRequest = sinon.stub(Client, 'authorizedAsGuestApiRequest');
	});

	after(function () {
		mockedAuthorizedRequest.restore();
		mockedGuestAuthorizedRequest.restore();
	});

	beforeEach(function () {

		var getAssetJSON = __html__['test/mocks/getAsset.json'],
			getAssetsJSON = __html__['test/mocks/getAssets.json'];

		fakeAssetGetResponse = JSON.parse(getAssetJSON);
		fakeAssetsGetResponse = JSON.parse(getAssetsJSON);
	});

	it('should exist', function () {
		expect(Assets).to.exist;
		expect(Assets).to.have.property('getPublicAssetsByConditions');
		expect(Assets).to.have.property('getPublicAsset');
		expect(Assets).to.have.property('getAsset');
		expect(Assets).to.have.property('getMyAssets');
		expect(Assets).to.have.property('createAsset');
		expect(Assets).to.have.property('updateAsset');
		expect(Assets).to.have.property('removeAsset');
		expect(Assets).to.have.property('retrieveAssetThumbnails');
		expect(Assets).to.have.property('retrieveAssetSources');
		expect(Assets).to.have.property('createAssetThumbnails');
		expect(Assets).to.have.property('createAssetSources');
		expect(Assets).to.have.property('deleteAssetSources');
		expect(Assets).to.have.property('deleteAssetThumbnails');
	});
	it('should get a user\'s asset successfully', function () {
		var assetId = 1474495;
		//mock
		mockedAuthorizedRequest.withArgs('/assets/' + assetId).returns({
			get: function () {
				return Promise.resolve(fakeAssetGetResponse);
			}
		});

		return Assets.getAsset(assetId).then(function (response) {
			expect(response).to.have.property('asset_id', assetId);
			expect(response).to.have.deep.property('artist.artist_id', fakeAssetGetResponse.artist.artist_id);
			expect(response).to.have.property('thumbnails');
			expect(response.thumbnails).to.have.length(6);
		});

	});

	it('should reject getAsset by assetId for an assetId that is not a number', function () {
		return Assets
			.getAsset('a string')
			.then(function (response) {
			})
			.catch(function (error) {
				expect(error).to.be.an.instanceof(Object);
				expect(error).to.have.property('message');
			});
	});
});
