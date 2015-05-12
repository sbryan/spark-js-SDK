describe('Members', function() {
	'use strict';

	var Members;

	before(function() {
		Members = ADSKSpark.Members;
	});

	it('should exist', function() {
		expect(Members).to.exist;
		expect(Members).to.have.property('getMemberProfile');
		expect(Members).to.have.property('getMyProfile');

	});
});
