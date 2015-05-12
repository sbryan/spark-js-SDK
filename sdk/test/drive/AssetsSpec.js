describe('Assets', function() {
	'use strict';

	var Assets;

	before(function() {
		Assets = ADSKSpark.Assets;
	});

	it('should exist', function() {
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
});
