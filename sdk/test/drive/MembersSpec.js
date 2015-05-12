describe('Members', function () {
	'use strict';

	var Members, mockedAuthorizedRequest, fakeMember;


	before(function () {
		Members = ADSKSpark.Members;
		var Client = ADSKSpark.Client;
		mockedAuthorizedRequest = sinon.stub(Client, 'authorizedApiRequest');
	});

	beforeEach(function () {

		//this object is partial and contains many more fields
		fakeMember = {
			member: {
				id: 10002,
				first_name: 'John',
				last_name: 'Doe',
				profile:{
					avatar_path:'https://static.spark.autodesk.com/image.png'
				}
			}
		};
	});

	it('should exist', function () {
		expect(Members).to.exist;
		expect(Members).to.have.property('getMemberProfile');
		expect(Members).to.have.property('getMyProfile');
	});


	it('should get a member\'s profile by memberId', function () {

		//mock
		mockedAuthorizedRequest.withArgs('/members/' + fakeMember.member.id).returns({
			get: function () {
				return Q.resolve(fakeMember);
			}
		});

		return Members.getMemberProfile(fakeMember.member.id).then(function (response) {
			expect(response).to.have.property('member');
			expect(response.member).to.have.property('id', fakeMember.member.id);
			expect(response.member).to.have.property('first_name', fakeMember.member.first_name);
			expect(response.member).to.have.property('last_name', fakeMember.member.last_name);
			expect(response.member).to.have.property('profile', fakeMember.member.profile);
			expect(response.member).to.have.deep.property('profile.avatar_path', fakeMember.member.profile.avatar_path);
		});

	});

	it('should reject get a member\'s profile by memberId for a memberId that is not a number', function () {

		return Members
			.getMemberProfile('a string')
			.then(function (response) {})
			.catch(function (error) {
				expect(error).to.be.an.instanceof(Object);
				expect(error).to.have.property('message');
			});

	});

	it('should get a member\'s own profile', function () {

		//mock
		mockedAuthorizedRequest.withArgs('/members').returns({
			get: function () {
				return Q.resolve(fakeMember);
			}
		});

		return Members.getMyProfile().then(function (response) {
			expect(response).to.have.property('member');
			expect(response.member).to.have.property('id', fakeMember.member.id);
			expect(response.member).to.have.property('first_name', fakeMember.member.first_name);
			expect(response.member).to.have.property('last_name', fakeMember.member.last_name);
			expect(response.member).to.have.deep.property('profile.avatar_path', fakeMember.member.profile.avatar_path);
		});

	});
});
