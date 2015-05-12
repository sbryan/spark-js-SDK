describe('Constants', function() {
	'use strict';

	var Constants;

	before(function() {
		Constants = ADSKSpark.Constants;
	});

	it('should exist', function() {
		expect(Constants).to.exist;
		expect(Constants).to.have.property('API_HOST_PROD');
		expect(Constants).to.have.property('API_HOST_SANDBOX');

	});
});
