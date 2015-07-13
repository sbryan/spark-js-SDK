# Spark JavaScript SDK

### Overview
This open-source web client SDK enables you to easily integrate the Spark REST APIs into your application. 

<b>Spark APIs are current in beta: <a href="https://spark.autodesk.com/developers/" target="_blank">Request access</a>.</b>

### Prerequisites
* A registered application on <a href="https://spark.autodesk.com/developers/" target="_blank">Spark Developer Portal</a>. For more information see the <a href="https://spark.autodesk.com/developers/reference/introduction/tutorials/register-an-app" target="_blank">tutorial</a>.

### Installation
To use the Spark JavaScript SDK you must first add an app on the Spark Developer’s Portal and save the app key Spark generates.

1) Include the SDK library in your HTML page just before closing the body section (`</body>`).

```HTML
<script type="text/javascript" src="//code.spark.autodesk.com/autodesk-spark-sdk-latest.min.js"></script>
```

2) After including the SDK library, use the method ADSKSpark.Client.initialize() to initialize the SDK:<br>

```JavaScript
ADSKSpark.Client.initialize(
  '<app key>', //A string containing your Spark app key, provided during registration.
  'isProduction', //(Optional) Whether we work in production or sandbox environment - default is sandbox
  '<redirect uri>' // (Optional) The redirect URI for the auth service (i.e. http://example.com/callback), in cases where it is different than the one that was set for your app's Callback URL
);
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
        ADSKSpark.Client.initialize(
          '<app key>', //A string containing your Spark app key, provided during registration.
          'isProduction', //(Optional) Whether we work in production or sandbox environment - default is sandbox
          '<redirect uri>' // (Optional) The redirect URI for the auth service (i.e. http://example.com/callback), in cases where it is different than the one that was set for your app's Callback URL
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
