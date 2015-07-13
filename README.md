# Spark JavaScript SDK

### Overview
This open-source web client SDK enables you to easily integrate the Spark REST APIs into your application. 

<b>Spark APIs are current in beta: <a href="https://spark.autodesk.com/developers/" target="_blank">Request access</a>.</b>

### Prerequisites
* A registered application on <a href="https://spark.autodesk.com/developers/" target="_blank">Spark Developer Portal</a>. For more information see the <a href="https://spark.autodesk.com/developers/reference/introduction/tutorials/register-an-app" target="_blank">tutorial</a>.
* (Optional) A server side implementation of the authentication API calls (guest, access and refresh tokens). This is required if you are using the advanced 3-legged auth flow. Sample Node.js code implementing the server side is located in the repository's <a href="https://github.com/spark3dp/spark-js-sdk/tree/master/authentication_server/nodejs" target="_blank">nodejs server</a> folder.

### Installation
To use the Spark JavaScript SDK you must first add an app on the Spark Developer’s Portal and save the app key Spark generates.

1) Include the SDK library in your HTML page just before closing the body section (`</body>`).

```HTML
<script type="text/javascript" src="//code.spark.autodesk.com/autodesk-spark-sdk-0.1.0.min.js"></script>
```

2) After including the SDK library, use the method ADSKSpark.Client.initialize() to initialize the SDK:<br>

```JavaScript
ADSKSpark.Client.initialize(
  '<app key>', //A string containing your Spark app key, provided during registration.
  '<is production>', //(Optional - true/false) Whether we work in production or sandbox environment - default is sandbox
  '<redirect uri>', // (Optional) The redirect URI for the auth service (i.e. http://example.com/callback), in cases where it is different than the one that was set for your app's Callback URL
  '<guest token URL>', //(Optional) The server URL to which guest token requests will be directed, for example http://example.com/guest_token. The SDK requires that authentication APIs are called from a server.
  '<access token URL>', //(Optional) The server URL to which access token requests will be directed, for example http://example.com/access_token.
  '<refresh access token URL>' //(Optional) The server URL to which refresh access token requests will be directed.
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
        <a onclick="login()">Login</a>
        <br/>
        <a onclick="getGuestToken()">Get a guest token</a>
    </div>

    <script type="text/javascript" src="//code.spark.autodesk.com/autodesk-spark-sdk-0.1.0.min.js"></script>
    <script>
      ADSKSpark.Client.initialize(
              '',// Your app key
              false,
              'http://localhost/webapp-samples/plugins/login/login-callback.html', // (Optional) The redirect URI for the auth service (i.e. http://example.com/callback), if it is different to the one that was set for your app's Callback URL
              'http://localhost:3000/guest_token',// The guest token endpoint implemented by your server (i.e. http://example.com/guest_token)
              'http://localhost:3000/access_token',// The access token endpoint implemented by your server (i.e. http://example.com/access_token)
              'http://localhost:3000/refresh_token'// The refresh access token endpoint implemented by your server (i.e. http://example.com/refresh_token)
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
