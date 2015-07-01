Spark NodeJS server
===================
This server implements required [Spark OAuth2.0](https://spark.autodesk.com/developers/reference/authentication) endpoints:

* Access token callback endpoint - `/access_token`
* Guest token callback endpoint - `/guest_token`
* Refresh token callback endpoint - `/refresh_token`


All endpoints are accessible through `http://your-server-url:3000/the_endpoint` where `the_endpoint` is one of the end points above.

###To run the server
* Copy config.example.js to config.js and enter your [app key and app secret](https://spark.autodesk.com/developers/myApps). 
* [Install nodejs and npm](https://docs.npmjs.com/getting-started/installing-node)
* Run:
```sh
$ npm install
$ node server.js
```

You now have a server running on your machine with the access, guest and refresh token endpoints.
