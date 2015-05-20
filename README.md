### Spark JavaScript SDK

This is a prototype client side SDK for the Spark REST APIs, providing:
* A convenient interface for application developers.
* An abstract layer for the Spark APIs.
* High-level functionality by chaining/callbacking APIs together.

This SDK requires a server side implementation of the guest and access tokens. You can find various sample implementations in this repository such as https://github.com/spark3dp/spark-js-sdk/tree/master/authentication_server/nodejs.

For full API reference see the following:
* <i>Authentication</i> - https://spark.autodesk.com/developers/reference/authentication
* <i>Print APIs</i> - https://spark.autodesk.com/developers/reference/print
* <i>Drive APIs</i> - https://spark.autodesk.com/developers/reference/drive
* <i>Print Firmware APIs</i> - https://spark.autodesk.com/developers/reference/firmware 

We have provided two quick start guides, the first uses the sample index.html file provided in GitHub, the second instructs you on how to create your own index.html file.

### Quick Start 1: Using the supplied index.html
* Get the latest published version of the SDK [here](https://code.spark.autodesk.com/autodesk-spark-sdk-latest.min.js).
* The full SDK reference is available [here](http://code.spark.autodesk.com/autodesk-spark-sdk/docs/v1/index.html).

<b>Setup the index.html file:</b><br>
   1. Copy the file `/authentication/frontend_server/Public/index.sample.html` to <i>index.html</i>.<br>
   2. Initialize the <i>APP_KEY</i> variable to the value of your Spark app's App Key (provided during app registration). **If you are runnning the SDK in production** then change the <i>API_ROOT</i> variable initialization to "api".<br>
   3. In the variables GUEST_TOKEN_URL, ACCESS_TOKEN_URL and REFRESH_TOKEN_URL (just below APP_KEY), enter the server URLs to which these calls will be directed. The SDK requires that authentication APIs are called from a server and the repository in which the SDK is located also contains a node.js implementation of these servers in the <i>authentication_server</i> folder.<br> If you use this implmentation \, there is no need to change the provided settings for GUEST_TOKEN_URL, ACCESS_TOKEN_URL and REFRESH_TOKEN_URL.<br>
   4. Set the "Callback URL" field on the Spark app to return to the <i>index.html</i> file.<br>
   ![Spark Callback URL entry](https://dp6mb85fgupxl.cloudfront.net/blog-prd-content/uploads/2015/05/x1.png)<br>

###Quick Start 2: Initializing the SDK in an index.html file.
* Get the latest published version of the SDK [here](https://code.spark.autodesk.com/autodesk-spark-sdk-latest.min.js).
* The full SDK reference is available [here](http://code.spark.autodesk.com/autodesk-spark-sdk/docs/v1/index.html).

1) <b>Include the SDK library in your HTML page</b> just before closing the body section (`</body>`).
```HTML
<script type="text/javascript" src="//code.spark.autodesk.com/autodesk-spark-sdk-latest.min.js"></script>
```
2) **After** including the SDK library, the method ADSKSpark.Client.initialize() must be used to initialize and setup the SDK:</b><br>
ADSKSpark.Client.initialize() is passed five values:<br>
a. **App Key** - A string containing your Spark app's (provided during registration).<br>
b. **Guest token URL** - The server URL to which guest token requests will be directed. The SDK requires that authentication APIs are called from a server: The repository in which the SDK is located also contains a node.js implementation of these servers in the <i>authentication_server</i> folder.<br>
c. **Access token URL** - The server URL to which access token requests will be directed.<br>
d. **Refresh access token URL** - The server URL to which refresh access token requests will be directed.<br>
e. **ADSKSpark.Constants.API_HOST_SANDBOX** or **ADSKSpark.Constants.API_HOST_PRODUCTION** - A constant specifying whether the SDK is running in sandbox or production.

      ```ADSKSpark.Client.initialize('',// Your app key
              '',// The guest token endpoint that is implemented by your server (i.e. http://example.com/guest_token)
              '',// The access token endpoint that is implemented by your server (i.e. http://example.com/access_token)
              '',// The refresh access token endpoint that is implemented by your server (i.e. http://example.com/refresh_token)
              ADSKSpark.Constants.API_HOST_SANDBOX // api host - API_HOST_PRODUCTION or API_HOST_SANDBOX
      );```

3) See the Sample Code section below for additional options.

#### Sample Code

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
If you want to propose changes to the SDK,  please try to work according to the following guidelines.

#### General
Use JS best practices in your code. See [Google's JS guidelines](https://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml).

The following conventions are used in this code base. 

#### Structure Guidelines
* Divide your logic between files - Each file should hold, as far as possible, only one coherent subject that identifies it (for example - "Print Preparation").
* Each file should be self-sufficient in scoping, global variables and poluting the window namespace. 
* Clearly distinguish between private and public methods using the [module pattern](http://addyosmani.com/resources/essentialjsdesignpatterns/book/#modulepatternjavascript).
* Separate API groups by putting module files in the main directory (i.e. print-preparation.js should reside in the print directory).
* Separate utilities under the "utilities" directory (i.e. request.js that handles all xhr to API).
* Use the following structure:
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

#### Naming Conventions
* File Names:
  * Files containing a primary class or object interface: The file name should match the class or object name.
  * Use upper or lower camel case for file names, not dashes and underscores.
* Variables should be camelCase.
* Objects should be in PascalCase.
* Constants should be all cases with underscores between words.

#### More conventions
* Use constants instead of string values, for example instead of using this:
```JavaScript
if (response.code === 'error'){
  //do stuff
}
```
Use this (define RESPONSE_ERROR_MSG in a separate constants file):
```JavaScript
if (response.code === RESPONSE_ERROR_MSG){
  //do stuff
}
```

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
See the README.md inside the test folder.

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
