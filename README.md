### Spark JavaScript SDK

This is a prototype client side SDK for the Spark REST APIs, providing:
* A convenient interface for application developers.
* An abstract layer for the Spark APIs.
* High-level functionality by chaining/callbacking APIs together.

This SDK requires a server side implementation of the guest and access tokens. You can find various sample implementations in this repository such as https://github.com/spark3dp/spark-js-sdk/tree/master/authentication_server/nodejs.

####API Reference
For full API reference see the following:
* <i>Authentication</i> - https://spark.autodesk.com/developers/reference/authentication
* <i>Print APIs</i> - https://spark.autodesk.com/developers/reference/print
* <i>Drive APIs</i> - https://spark.autodesk.com/developers/reference/drive
* <i>Print Firmware APIs</i> - https://spark.autodesk.com/developers/reference/firmware 


### Quick start with the supplied index.html
* Get the latest published version of the SDK [here](https://code.spark.autodesk.com/autodesk-spark-sdk-latest.min.js).
* The full SDK reference is available [here](http://code.spark.autodesk.com/autodesk-spark-sdk/docs/v1/index.html).

<b>Setup the index.html file:</b><br>
   1. Copy the file `/authentication/frontend_server/Public/index.sample.html` to <i>index.html</i>.<br>
   2. Initialize the <i>APP_KEY</i> variable to the value of your Spark app's App Key (provided during app registration). **If you are runnning the SDK in production** then change the <i>API_ROOT</i> variable initialization to "api".<br>
   3. In the variables GUEST_TOKEN_URL, ACCESS_TOKEN_URL and REFRESH_TOKEN_URL (just below APP_KEY), enter the server URLs to which these calls will be redirected. The SDK requires that authentication APIs are called from a server and the repository in which the SDK is located also contains a node.js implementation of these servers in the <i>authentication_server</i> folder.<br> If you use this implmentation \, there is no need to change the provided settings for GUEST_TOKEN_URL, ACCESS_TOKEN_URL and REFRESH_TOKEN_URL.<br>
   4. Set the "Callback URL" field on the Spark app to return to the <i>index.html</i> file.<br>
   ![Spark Callback URL entry](https://dp6mb85fgupxl.cloudfront.net/blog-prd-content/uploads/2015/05/x1.png)<br>

###Quick start.
* Get the latest published version of the SDK [here](https://code.spark.autodesk.com/autodesk-spark-sdk-latest.min.js).
* The full SDK reference is available [here](http://code.spark.autodesk.com/autodesk-spark-sdk/docs/v1/index.html).

1. <b>Include the SDK library in your HTML page</b> just before closing the body section (`</body>`).
```HTML
<script type="text/javascript" src="//code.spark.autodesk.com/autodesk-spark-sdk-latest.min.js"></script>
```
2. Set the initial client settings in ADSKSpark.Client.initialize

#### Sample code

```HTML
<!DOCTYPE html>
<html>
  <head>
	<title>Sample Code</title>
	<meta charset="utf-8">
  </head>
  <body>
    <div class="content">

    </div>

    <script type="text/javascript" src="//code.spark.autodesk.com/autodesk-spark-sdk-latest.min.js"></script>
    <script>
      ADSKSpark.Client.initialize('',// Your app key
              '',// The guest token endpoint that is implemented by your server (i.e. http://example.com/guest_token)
              '',// The access token endpoint that is implemented by your server (i.e. http://example.com/access_token)
              '',// The refresh access token endpoint that is implemented by your server (i.e. http://example.com/refresh_token)
              ADSKSpark.Constants.API_HOST_SANDBOX // api host - API_HOST_PRODUCTION or API_HOST_SANDBOX
      );

      	/**
      	 * Open login window
      	 */
      	function login() {
      		ADSKSpark.Client.openLoginWindow();
      	}

      	function logout(){
      		ADSKSpark.Client.logout();
      		location.reload();
      	}

      	function getGuestToken(){
      		ADSKSpark.Client.getGuestToken().then(function(guestToken) {
      			console.log('guest token: ',guestToken);
      		});
      	}


      	if (ADSKSpark.Client.isAccessTokenValid()) {
      		console.log('access token: ',ADSKSpark.Client.getAccessToken());
            ADSKSpark.Members.getMyProfile().then(function(response){
              console.log('Current logged in member is: ', response.member);
            });
      	}

    </script>
  </body>
</html>
```

### Code Guidelines
In order to create a coherent code base for current and future code on this SDK, one should try to work according to the guidelines below.

#### General
As a general approach always try to use JS best practices in your code. You can find a good reference in [Google's JS guidelines](https://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml).

The other important thing is to stick to the current conventions in this code base. 

#### Structure Guidelines
* Devide your logic between files - don't hold everything inside a single file. Each file should hold, as far as possible, only one coherent subject that identifies this file (for example - "Print Preparation").
* Each file should be self sufficient in the sense of scoping, global variables anf poluting the window namespace. 
* You are advised to apply the [module pattern](http://addyosmani.com/resources/essentialjsdesignpatterns/book/#modulepatternjavascript) to make sure you create a clear distinction between private and public methods.
* Create a clear separation between the API groups by putting the different module files in main directory (i.e. print-preparation.js should reside in the print directory)
* Utilities should be in a separate files under the "utilities" directory (i.e. request.js that handles all xhr to API)
* Consider the next structure as your guideline:
```
  - sdk
  -- src
  --- config
  ---- constants.js
  --- utilities
  ---- request.js
  ---- paginated.js
  --- auth
  ---- client.js
  --- print
  ---- print-meta.js
  ---- print-preparation.js
  ---- printer-registration.js
  ---- printer-management.js
  ---- printer-firmware.js
  --- drive
  ---- files.js
  ---- assets.js
  ---- members.js
  -- test
  --- config
  ---- constants.js
  --- utilities
  ---- request.js
  ---- paginated.js
  --- auth
  ---- client.js
  --- print
  ---- print-meta.js
  ---- print-preparation.js
  ---- printer-registration.js
  ---- printer-management.js
  ---- printer-firmware.js
  --- drive
  ---- files.js
  ---- assets.js
  ---- members.js
  -- sample-apps
  --- authentication_sample
  --- 3d_printer_sample
  --- print_preparation_sample
  --- storage_app
  --- gallery_app
  -- karma.conf.js
  -- Gruntfile.js
  -- package.json
  - authentication-server
  -- nodejs
  -- ...
  -- ...
  - README.md
  - LICENSE
  - .gitignore
```  

#### Naming conventions
* File names should follow these conventions:
  * When a file contains a primary class or object interface the file name should match the class or object name.
  * Otherwise the author should name the file to describe the contents as best as possible within a reasonable name length.
  * Use of dashes and underscores in filenames is discouraged. Upper or lower camel case for filenames is preferred.
* Variables should be camelCase
* Objects should be in PascalCase
* Constants should be all cases with underscores between words

#### More conventions
* Use constants instead of string values, for example instead of using this:
```JavaScript
if (response.code === 'error'){
  //do stuff
}
```
Use
```JavaScript
if (response.code === RESPONSE_ERROR_MSG){
  //do stuff
}
```
Where you define RESPONSE_ERROR_MSG in a separate constants file.

### Testing and Packaging

Install Node.js and then:

```sh
$ git clone git://github.com/spark3dp/spark-js-sdk
$ sudo npm -g install grunt-cli karma bower
$ cd spark-js-sdk/sdk
$ npm install
$ bower install
```

### Testing
See the README.md inside the test folder

### Packaging

To build your own package:

```sh
$ grunt build
```
or

```sh
$ grunt build:[version]
```
Where version might be any string.
