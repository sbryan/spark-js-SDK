Authentication Samples
========================
## Introduction
This sample code demonstrates Spark's login flows through _Implicit_ and _Explicit (Server)_ login: App and user authentication based on the OAuth2 protocol.

The purpose of the samples provided here is to show you how you can acquire access and guest tokens in order to make authorized calls to Spark API.

## Prerequisites
* A registered app on the [Spark Developers Portal](https://spark.autodesk.com/developers). For more information see the [tutorial](https://spark.autodesk.com/developers/reference/introduction/tutorials/register-an-app).


## Installation
* Include the SDK library in your HTML page, just before closing the body section (`</body>`).

```HTML
<script type="text/javascript" src="//code.spark.autodesk.com/autodesk-spark-sdk.min.js"></script>
```

##Implicit Login flow
The implicit flow is a simplified flow in the sense that it doesn't require the usage of APP_SECRET to perform authentication,
and therefore doesn't require to implement a server where you can "hide" your APP_SECRET from prying eyes.

Implicit login provides you with an access token that expires after 2 hours without the ability to refresh (renew) the token. To be able
to refresh the token for longer times you will have to implement the Explicit flow (see below)

### Quick Start
#### Step 1 - Initialize Client
You initialize the SDK JS Client with the above APP_KEY that was provided during app registration.

```JavaScript
ADSKSpark.Client.initialize('<your-app-key>'));
```

#### Step 2 - Login Page
You redirect the user to the login page.

```JavaScript
	//Redirect user to login page
	function login() {
		location.href = ADSKSpark.Client.getLoginRedirectUrl();
	}
```

#### Step 3 - Handle Login / Access Token Callback
The access token will be returned to one of the following:

1. The original page (<b>the sample code's default setting</b>).<br>
2. The (optional) redirect URI you supplied in initialize (see Additional Configuration section).<br>
3. The callback URL you defined in app registration.<br>

```JavaScript
ADSKSpark.Client.completeLogin(false).then(function (token) {
		if (token) {
			location.href = location.protocol + '//' + location.host + location.pathname;
		} else {
			console.error('Problem with fetching token');
		}
	});
```

### Complete Sample Code
```HTML
 <!DOCTYPE html>
<html lang="en">
<head>
	<title>Spark Sample Application - Implicit Login</title>
	<meta charset="utf-8">
	<!-- Bootstrap core CSS -->
	<link href="//maxcdn.bootstrapcdn.com/bootstrap/3.3.4/css/bootstrap.min.css" rel="stylesheet">
</head>

<body>

<div class="container">
	<div class="col-md-12">
		<p class="token-wrapper" id="access-token">Access Token: <b id="access-token-span">none</b></p>
		<a onclick="login()" id="login" class="btn btn-primary">Login to Get an Access Token (Implicit)</a>
		<a onclick="logout()" id="logout" class="btn btn-primary">Logout</a>
	</div>
</div>

<script type="text/javascript" charset="utf-8" src="//code.jquery.com/jquery-2.1.3.min.js"></script>
<!-- include the SPARK JS SDK -->
<script type="text/javascript" src="//code.spark.autodesk.com/autodesk-spark-sdk.min.js"></script>
<script>

	// Initialize Spark client
	ADSKSpark.Client.initialize('<your-app-key>');

	//Open login window
	function login() {
		location.href = ADSKSpark.Client.getLoginRedirectUrl();
	}

	//Logout button function
	function logout() {
		ADSKSpark.Client.logout();
		location.href = location.protocol + '//' + location.host + location.pathname;
	}


	// Checks on load/reload if the Access_token exists in local storage.
	if (ADSKSpark.Client.isAccessTokenValid()) {
		$('#access-token-span').text(ADSKSpark.Client.getAccessToken());
		$('#login').hide();
		$('#logout').css('display', 'inline-block');
	}else{
		//Complete the login flow after the redirect from Authentication.
    	ADSKSpark.Client.completeLogin(false).then(function (token) {
    		// Get the access_token
    		if (token) {
    			location.href = location.protocol + '//' + location.host + location.pathname;
    		} else {
    			console.error('Problem with fetching token');
    		}
    	});
    }
</script>
</body>
</html>
```


##Explicit Login flow
This explicit flow enables you to get an access token and to be able to prolong it through the refresh token mechanism.
This flow requires an APP_SECRET and therefore we strongly encourage you implement a server that holds the APP_SECRET and implements
the Explicit flow. This repository has a nodejs sample server implementation that you can use for your convenience.

### Quick Start
#### Step 1 - Configure your Keys and Server
* In `spark-js-sdk/samples/authentication/explicit_login.html` conduct these changes:

1. Initialize APP_KEY with your App Key.
2. Set the `options` object with your redirect URI and your server endpoints. The defaults that are set in this file assume you will be using nodejs server that is supplied with this repository (if you are using a different server implementation, you should skip directly to Step 3)

* Copy `spark-js-sdk/authentication_server/nodejs/config.example.js` file to a new file named `spark-js-sdk/authentication_server/nodejs/config.js` and:

1. Initialize APP_KEY with your App Key.
2. Initialize APP_SECRET with your App Secret.

## Step2 - Install NodeJS server

* [Install NodejJS and npm](https://docs.npmjs.com/getting-started/installing-node)
* Run inside the `authentication_server/nodejs` directory:

```sh
$ npm install
$ node server.js
```

#### Step 3 - Initialize Client
You initialize the SDK JS Client with the above APP_KEY that was provided during app registration.

```JavaScript
	//Init the Spark Client - you may supply your personal config through the config.js file
	var SERVER_URL = 'http://localhost:3000',
	    GUEST_TOKEN_URL = SERVER_URL + '/guest_token',
		ACCESS_TOKEN_URL = SERVER_URL + '/access_token',
		REFRESH_TOKEN_URL = SERVER_URL + '/refresh_token';

	var options = {
		guestTokenUrl: GUEST_TOKEN_URL,
		accessTokenUrl: ACCESS_TOKEN_URL,
		refreshTokenUrl: REFRESH_TOKEN_URL
	};

	ADSKSpark.Client.initialize('<your-app-key>',options));
```

#### Step 4 - Login Page
You redirect the user to the login page with the `isServer` parameter set to true.

```JavaScript
	//Redirect user to login page
	function login() {
		location.href = ADSKSpark.Client.getLoginRedirectUrl(false, true);
	}
```

#### Step 5 - Handle Login / Access Token Callback
The access token will be returned to one of the following:

1. The original page (<b>the sample code's default setting</b>).<br>
2. The (optional) redirect URI you supplied in initialize (see Additional Configuration section).<br>
3. The callback URL you defined in app registration.<br>

```JavaScript
ADSKSpark.Client.completeLogin(true).then(function (token) {
		if (token) {
			location.href = location.protocol + '//' + location.host + location.pathname;
		} else {
			console.error('Problem with fetching token');
		}
	});
```

### Complete Sample Code
```HTML
 <!DOCTYPE html>
<html lang="en">
<head>
	<title>Spark Sample Application - Implicit Login</title>
	<meta charset="utf-8">
	<!-- Bootstrap core CSS -->
	<link href="//maxcdn.bootstrapcdn.com/bootstrap/3.3.4/css/bootstrap.min.css" rel="stylesheet">
</head>

<body>

<div class="container">
	<div class="col-md-12">
		<p class="token-wrapper" id="access-token">Access Token: <b id="access-token-span">none</b></p>
		<a onclick="login()" id="login" class="btn btn-primary">Login to Get an Access Token (Implicit)</a>
		<a onclick="logout()" id="logout" class="btn btn-primary">Logout</a>
	</div>
</div>

<script type="text/javascript" charset="utf-8" src="//code.jquery.com/jquery-2.1.3.min.js"></script>
<!-- include the SPARK JS SDK -->
<script type="text/javascript" src="//code.spark.autodesk.com/autodesk-spark-sdk.min.js"></script>
<script>

	//Init the Spark Client
	var options = {
		redirectUri: '',
		guestTokenUrl: 'http://localhost:3000/guest_token',
		accessTokenUrl: 'http://localhost:3000/access_token',
		refreshTokenUrl: 'http://localhost:3000/refresh_token'
	};

	// Initialize Spark client
	ADSKSpark.Client.initialize('<your-app-key>', options);

	//Open login window
	function login() {
		location.href = ADSKSpark.Client.getLoginRedirectUrl(false, true);
	}

	//Logout button function
	function logout() {
		ADSKSpark.Client.logout();
		location.href = location.protocol + '//' + location.host + location.pathname;
	}


	// Checks on load/reload if the Access_token exists in local storage.
	if (ADSKSpark.Client.isAccessTokenValid()) {
		$('#access-token-span').text(ADSKSpark.Client.getAccessToken());
		$('#login').hide();
		$('#logout').css('display', 'inline-block');
	}else{
		//Complete the login flow after the redirect from Authentication.
    	ADSKSpark.Client.completeLogin(true).then(function (token) {
    		// Get the access_token
    		if (token) {
    			location.href = location.protocol + '//' + location.host + location.pathname;
    		} else {
    			console.error('Problem with fetching token');
    		}
    	});
    }
</script>
</body>
</html>
```


### Additional Configuration
You can send optional parameters to the initialization method:

```JavaScript
 var options = {
		isProduction:false, //(Optional - true/false) Whether your app runs in production or the sandbox test environment. The default is sandbox.
		redirectUri: '',// (Optional) The redirect URI for the auth service (i.e. http://example.com/callback), in cases where it is different to the Callback URL you defined in the app registration screen.
		guestTokenUrl: '',//(Optional) The server URL to which guest token requests will be directed, for example http://example.com/guest_token.
		accessTokenUrl: '',//(Optional) The server URL to which access token requests will be directed, for example http://example.com/access_token.
		refreshTokenUrl: ''//(Optional) The server URL to which refresh access token requests will be directed.
    };

ADSKSpark.Client.initialize('<your-app-key>',options);
```
<b>isProduction</b> - isSandbox or isProduction, this parameter initializes the client for the desired environment.<br>
<i>Note!</i>  Each environment uses a different APP_KEY.

<b>redirectUri</b> - The redirect URI to which the access_token is returned.
The redirect URI must match the callback URL defined during app registration.
If no redirectUri is entered, the access token is retured to the page that loaded the login dialog.


## Usage
Open `spark-js-sdk/samples/authentication/implicit-login.html` or `spark-js-sdk/samples/authentication/explicit-login.html`
