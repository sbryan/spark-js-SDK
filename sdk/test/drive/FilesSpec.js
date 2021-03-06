describe('Files', function () {
	'use strict';

	var Files, mockedAuthorizedRequest, fakeFileRespPrivate, fakeFileRespPublic;


	before(function () {
		Files = ADSKSpark.Files;
		var Client = ADSKSpark.Client;
		mockedAuthorizedRequest = sinon.stub(Client, 'authorizedApiRequest');
	});

	after(function () {
		mockedAuthorizedRequest.restore();
	});

	beforeEach(function () {
		fakeFileRespPrivate = {
			"files": [{
				"name": "53182354.jpg",
				"md5sum": "91068a8a388ea1a0cf29e3f1ba61ca6a",
				"file_id": 17208417,
				"public_url": ""
			}]
		};

		fakeFileRespPublic = {
			"files": [{
				"name": "53182355.jpg",
				"md5sum": "91068a8a388ea1a0cf29e3f1ba61ca6b",
				"file_id": 17208418,
				"public_url": "http://example.com/53182355.jpg"
			}]
		};

	});

	/**
	 * Load a mock file and return it as fileReader
	 * @param callback
	 */
	function loadBlobFile(callback) {

		var xhr = new XMLHttpRequest();
		xhr.open('GET', '/base/test/mocks/test_img.jpg', true);

		xhr.responseType = 'arraybuffer';

		xhr.onload = function() {
			var blob = new Blob([this.response],{ type: 'image/jpeg'});
			var fileReader = new FileReader();
			fileReader.onload = function() {
				callback(this);
			};
			fileReader.readAsArrayBuffer(blob);
		};

		xhr.send();
	}

	it('should exist', function () {
		expect(Files).to.exist;
		expect(Files).to.have.property('getFileDetails');
		expect(Files).to.have.property('uploadFile');
		expect(Files).to.have.property('downloadFile');

	});

	it('should get file details by fileId', function () {

		//mock
		mockedAuthorizedRequest.withArgs('/files/' + fakeFileRespPrivate.files[0].file_id).returns({
			get: function () {
				return Promise.resolve(fakeFileRespPrivate);
			}
		});

		return Files.getFileDetails(fakeFileRespPrivate.files[0].file_id).then(function (response) {
			expect(response).to.have.property('files');
			expect(response.files[0]).to.have.property('file_id', fakeFileRespPrivate.files[0].file_id);
			expect(response.files[0]).to.have.property('name', fakeFileRespPrivate.files[0].name);
			expect(response.files[0]).to.have.property('public_url', fakeFileRespPrivate.files[0].public_url);
		});

	});

	var testUploadedFile = function (isPublic) {
		var fileData = {
			file: 'file_name.jpg',
			unzip: false,
			public: isPublic
		};

		//mock
		mockedAuthorizedRequest.withArgs('/files/upload').returns({
			post: function (headers, fileData) {
				var file = isPublic ? fakeFileRespPublic : fakeFileRespPrivate;
				file.files.name = fileData.file;
				return Promise.resolve(fakeFileRespPrivate);
			}
		});


		return Files.uploadFile(fileData).then(function (response) {
			expect(response).to.have.property('files');
			expect(response.files[0]).to.have.property('file_id', fakeFileRespPrivate.files[0].file_id);
			expect(response.files[0]).to.have.property('name', fakeFileRespPrivate.files[0].name);
			expect(response.files[0]).to.have.property('public_url', fakeFileRespPrivate.files[0].public_url);
		});
	};

	it('should be able to upload a private file', function () {
		testUploadedFile(false);
	});

	it('should be able to upload a public file', function () {
		testUploadedFile(true);
	});

	it('should be able to download a file', function (done) {
		loadBlobFile(function(fakeDownloadFile){
			//mock
			mockedAuthorizedRequest.withArgs('/files/download').returns({
				get: function (headers, fileData) {
					return Promise.resolve(fakeDownloadFile);
				}
			});

			return Files.downloadFile(fakeFileRespPrivate.files[0].file_id).then(function (response) {
				expect(response).to.be.ok;
				done();
			});
		});
	});
});
