describe('Helpers', function() {
	'use strict';

	var Helpers;

	before(function() {
		Helpers = ADSKSpark.Helpers;
	});

	it('should exist', function() {
		expect(Helpers).to.exist;

		expect(Helpers).to.have.property('popupWindow');
		expect(Helpers).to.have.property('transformToAssocArray');
		expect(Helpers).to.have.property('extractParamsFromURL');
		expect(Helpers).to.have.property('jsonToParameters');
		expect(Helpers).to.have.property('isValidId');
		expect(Helpers).to.have.property('isValidIds');

	});

	it('should open a popup window', function() {
		var popup = Helpers.popupWindow('http://localhost',200,200);
		expect(popup).to.not.equal(null);
		expect(popup).to.have.property('document');
		expect(popup.document).to.have.property('bgColor');
	});

	it('should transform parameter strings to array of params', function() {
		var expectedParamsEmpty = Helpers.transformToAssocArray('');
		expect(expectedParamsEmpty).to.be.empty;

		var expectedParamsWithProperties = Helpers.transformToAssocArray('foo1=bar1&foo2=bar2');
		expect(expectedParamsWithProperties).to.have.property('foo1', 'bar1');
		expect(expectedParamsWithProperties).to.have.property('foo2', 'bar2');
	});

	it('should extract params from URL', function() {
		var expectedParamsEmpty = Helpers.extractParamsFromURL();
		expect(expectedParamsEmpty).to.be.empty;

		//mock
		sinon.stub(Helpers, 'transformToAssocArray').returns({'foo':'bar'});
		var expectedParamsWithProperties = Helpers.extractParamsFromURL('foo=bar');
		expect(expectedParamsWithProperties).to.have.property('foo', 'bar');
	});

	it('should convert some json to an encoded parameter string - w/o filter', function(){

		//empty call pass
		expect(Helpers.jsonToParameters()).to.be.null;

		//with empty obj
		var emptyObj = {};
		expect(Helpers.jsonToParameters(emptyObj)).to.equal('');

		//with normal obj
		var obj1 = {foo1:'bar1',foo2:'bar2'};
		expect(Helpers.jsonToParameters(obj1)).to.equal('foo1=bar1&foo2=bar2');
	});

	it('should convert some json to an encoded parameter string - with filter', function(){

		var obj1 = {foo1:'bar1',foo2:'bar2',foo3:'bar3'};

		var filterStr = 'foo3';
		expect(Helpers.jsonToParameters(obj1,filterStr)).to.equal('foo1=bar1&foo2=bar2');

		var filterArray = ['foo1','foo3'];
		expect(Helpers.jsonToParameters(obj1,filterArray)).to.equal('foo2=bar2');

		var filterFunc = function(val){
			return val !== 'foo1';
		};
		expect(Helpers.jsonToParameters(obj1,filterFunc)).to.equal('foo2=bar2&foo3=bar3');

	});

	it('isValidId should be valid for a number', function () {
		expect(Helpers.isValidId(2345456)).to.be.ok;
	});

	it('isValidId should not be valid for string', function () {
		expect(Helpers.isValidId('some string')).to.not.be.ok;
	});

	it('isValidId should not be valid for empty param', function () {
		expect(Helpers.isValidId()).to.not.be.ok;
	});

	it('isValidId should not be valid for empty string', function () {
		expect(Helpers.isValidId('')).to.not.be.ok;
	});


	it('isValidIds should be valid for a number', function () {
		expect(Helpers.isValidIds(2345456)).to.be.ok;
	});

	it('isValidIds should be valid for a comma seperated string of numbers', function () {
		expect(Helpers.isValidIds("2345456,1234567,543215")).to.be.ok;
	});

	it('isValidIds should be valid single string of a number', function () {
		expect(Helpers.isValidIds("2345456")).to.be.ok;
	});

	it('isValidIds should not be valid for negative numbers', function () {
		expect(Helpers.isValidIds(-100000)).to.not.be.ok;
	});

	it('isValidIds should not be valid for decimal numbers', function () {
		expect(Helpers.isValidIds(10.1)).to.not.be.ok;
	});

	it('isValidIds should not be valid for string which is not comma seperated numbers', function () {
		expect(Helpers.isValidIds('some string')).to.not.be.ok;
	});

	it('isValidIds should not be valid for empty param', function () {
		expect(Helpers.isValidIds()).to.not.be.ok;
	});

	it('isValidIds should not be valid for empty string', function () {
		expect(Helpers.isValidIds('')).to.not.be.ok;
	});


});
