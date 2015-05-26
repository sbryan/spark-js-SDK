# Spark JavaScript SDK

This is a web client SDK for the Spark REST APIs, providing:

* A convenient interface for application developers.
* An abstract layer for the Spark APIs.
* High-level functionality by chaining/callbacking APIs together.


This SDK requires:

* A registered application on [Spark Developer Portal](https://spark.autodesk.com/developers/).
* A server side implementation of the guest, access and refresh token API calls. Sample server side implementations are located in this repository in the [`server`](https://github.com/spark3dp/spark-js-sdk/tree/master/authentication_server) folder.

For full API reference see the following:

* <i>Authentication</i> - https://spark.autodesk.com/developers/reference/authentication
* <i>Print APIs</i> - https://spark.autodesk.com/developers/reference/print
* <i>Drive APIs</i> - https://spark.autodesk.com/developers/reference/drive
* <i>Print Firmware APIs</i> - https://spark.autodesk.com/developers/reference/firmware 

We have provided two quick start guides, the first uses the sample index.html file provided in GitHub, the second instructs you on how to create a simple index.html file.

### Quick Start 1: Using the supplied [index.sample.html](https://github.com/spark3dp/spark-js-sdk/blob/master/sample_apps/authentication_sample/frontend_server/public/index.sample.html)
* The full SDK reference is available [here](http://code.spark.autodesk.com/autodesk-spark-sdk/docs/v1/index.html).

####Setup the index.html file:
1. Copy the file `/authentication/frontend_server/Public/index.sample.html` to `/authentication/frontend_server/Public/index.html`.
2. Initialize the <i>APP_KEY</i> variable to the value of your Spark app's App Key (provided during app registration). **If you are runnning the SDK in production** then change the <i>API_ROOT</i> variable initialization to "api".
3. In the variables <i>GUEST_TOKEN_URL, ACCESS_TOKEN_URL and REFRESH_TOKEN_URL</i> (just below APP_KEY), enter the server URLs (endpoints) to which these calls will be directed. The SDK requires that authentication APIs are called from a server.
4. This repository also contains sample node.js code that implements these endpoints (located in the <i>authentication_server</i> folder).<br> If you use this implementation, there is no need to change the provided settings for GUEST_TOKEN_URL, ACCESS_TOKEN_URL and REFRESH_TOKEN_URL.
5. Set the "Callback URL" field on the Spark app to return to the <i>index.html</i> file.<br>
   ![Spark Callback URL entry](https://dp6mb85fgupxl.cloudfront.net/blog-prd-content/uploads/2015/05/x1.png)<br>

###Quick Start 2: Initializing the SDK in an index.html file.
* Get the latest published version of the SDK [here](https://code.spark.autodesk.com/autodesk-spark-sdk-latest.min.js).
* The full SDK reference is available [here](http://code.spark.autodesk.com/autodesk-spark-sdk/docs/v1/index.html).
* <b>Include the SDK library in your HTML page</b> just before closing the body section (`</body>`).

```HTML
<script type="text/javascript" src="//code.spark.autodesk.com/autodesk-spark-sdk-latest.min.js"></script>
```

* **After** including the SDK library, the method ADSKSpark.Client.initialize() must be used to initialize and setup the SDK:</b><br>
The SDK requires that authentication API requests are called from a server. For example the guest token URL could be <i>http://example.com/guest_token</i>. 

```JavaScript
ADSKSpark.Client.initialize(
'<app key>', //A string containing your Spark app key, provided during registration.
'<guest token URL>', //The server URL to which guest token requests will be directed, for example http://example.com/guest_token. The SDK requires that authentication APIs are called from a server.
'<access token URL>', //The server URL to which access token requests will be directed, for example http://example.com/access_token.
'<refresh access token URL>', //The server URL to which refresh access token requests will be directed.
ADSKSpark.Constants.API_HOST_SANDBOX // ADSKSpark.Constants.API_HOST_SANDBOX or ADSKSpark.Constants.API_HOST_PRODUCTION - A constant specifying whether the SDK is running in sandbox or production.
```

This repository also contains a node.js that implements these endpoints (located in the <i>authentication_server</i> folder).<br>

* See the Sample Code section below for additional options.

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
