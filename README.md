# Spark JavaScript SDK

This is a web client SDK for the Spark REST APIs, providing:

* A convenient interface for application developers.
* An abstract layer for the Spark APIs.
* High-level functionality by chaining/callbacking APIs together.

The SDK requires that authentication API requests are called from a server. For example the guest token URL could be <i>http://example.com/guest_token</i>.
This repository contains sample node.js code that implements these calls (located in the [authentication_server](https://github.com/spark3dp/spark-js-sdk/tree/master/authentication_server/nodejs) folder).


###Quick Start
* <b>Include the SDK library in your HTML page</b> just before closing the body section (`</body>`).

```HTML
<script type="text/javascript" src="//code.spark.autodesk.com/autodesk-spark-sdk-latest.min.js"></script>
```

* After including the SDK library, the method ADSKSpark.Client.initialize() must be used to initialize and setup the SDK:<br>

```JavaScript
ADSKSpark.Client.initialize(
  '<app key>', //A string containing your Spark app key, provided during registration.
  '<guest token URL>', //The server URL to which guest token requests will be directed, for example http://example.com/guest_token. The SDK requires that authentication APIs are called from a server.
  '<access token URL>', //The server URL to which access token requests will be directed, for example http://example.com/access_token.
  '<refresh access token URL>', //The server URL to which refresh access token requests will be directed.
  ADSKSpark.Constants.API_HOST_SANDBOX, // ADSKSpark.Constants.API_HOST_SANDBOX or ADSKSpark.Constants.API_HOST_PRODUCTION - A constant specifying whether the SDK is running in sandbox or production.
  '<redirect uri>' // (Optional) The redirect URI for the auth service (i.e. http://example.com/callback), in cases where it is different than the one that was set for your app's Callback URL 
)
```

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
              ADSKSpark.Constants.API_HOST_SANDBOX, // api host - API_HOST_PRODUCTION or API_HOST_SANDBOX
              '' // (Optional) The redirect URI for the auth service (i.e. http://example.com/callback), in cases where it is different than the one that was set for your app's Callback URL 
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

### Prerequsites
* A registered application on [Spark Developer Portal](https://spark.autodesk.com/developers/).
* A server side implementation of the guest, access and refresh token API calls. Sample server side implementations are located in this repository in the [nodejs server](https://github.com/spark3dp/spark-js-sdk/tree/master/authentication_server/nodejs) folder.

### API reference

* <i>Authentication</i> - https://spark.autodesk.com/developers/reference/authentication
* <i>Print APIs</i> - https://spark.autodesk.com/developers/reference/print
* <i>Drive APIs</i> - https://spark.autodesk.com/developers/reference/drive
* <i>Print Firmware APIs</i> - https://spark.autodesk.com/developers/reference/firmware
