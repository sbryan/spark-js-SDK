# Spark JavaScript SDK

### Overview
This is a web client SDK for the Spark REST APIs. For API reference and a general introduction see our [documentation](spark.autodesk.com/developers/reference/).

This client-side implementation of the Spark APIs requires a server-side handling the authentication APIs: Node.js code implementing the server-side is located in the repository's [authentication_server](https://github.com/spark3dp/spark-js-sdk/tree/master/authentication_server/nodejs) folder.


### Installation
1) Include the SDK library in your HTML page just before closing the body section (`</body>`).

```HTML
<script type="text/javascript" src="//code.spark.autodesk.com/autodesk-spark-sdk-latest.min.js"></script>
```

2) After including the SDK library, use the method ADSKSpark.Client.initialize() to initialize the SDK:<br>

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
              '',// The guest token endpoint implemented by your server (i.e. http://example.com/guest_token)
              '',// The access token endpoint implemented by your server (i.e. http://example.com/access_token)
              '',// The refresh access token endpoint implemented by your server (i.e. http://example.com/refresh_token)
              ADSKSpark.Constants.API_HOST_SANDBOX, // api host - API_HOST_PRODUCTION or API_HOST_SANDBOX
              '' // (Optional) The redirect URI for the auth service (i.e. http://example.com/callback), if it is different to the one that was set for your app's Callback URL 
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

### Requirements
* A registered application on [Spark Developer Portal](https://spark.autodesk.com/developers/).
* A server side implementation of the guest, access and refresh token API calls. Sample server side implementations are located in the [nodejs server](https://github.com/spark3dp/spark-js-sdk/tree/master/authentication_server/nodejs) folder.

