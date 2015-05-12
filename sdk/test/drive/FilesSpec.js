describe('Files', function() {
	'use strict';

	var Files;

	before(function() {
		Files = ADSKSpark.Files;
	});

	it('should exist', function() {
		expect(Files).to.exist;
		expect(Files).to.have.property('getFileDetails');
		expect(Files).to.have.property('uploadFile');

	});
});
