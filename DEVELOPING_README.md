# Spark JavaScript SDK
### Code Guidelines
Please following these guidelines when proposing code additions to the Spark open-source SDK.

Use JS best practices. See [Google's JS guidelines](https://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml).

The following conventions are used in this code base: 

#### Structure Guidelines
* Divide your logic between files - Each file should hold one coherent subject that identifies it (for example - "Print Preparation").
* Each file should be self-sufficient in scoping, global variables and populating the window namespace. 
* Clearly distinguish between private and public methods using the [module pattern](http://addyosmani.com/resources/essentialjsdesignpatterns/book/#modulepatternjavascript).
* Separate API groups by putting module files in the main directory (for example print-preparation.js resides in the print directory).
* Place utilities in the "utilities" directory (for example _request.js_ that handles all xhr to API).
* Use the following structure:
```
  - sdk
  -- src
  --- config
  ---- Constants.js
  --- utilities
  ---- Helpers.js
  ---- Request.js
  ---- Paginated.js
  --- auth
  ---- Client.js
  --- print
  ---- PrintMeta.js
  ---- PrintPreparation.js
  ---- PrinterRegistration.js
  ---- PrinterManagement.js
  ---- PrinterFirmware.js
  --- drive
  ---- Files.js
  ---- Assets.js
  ---- Members.js
  -- test
  --- config
  ---- ConstantsSpec.js
  --- utilities
  ---- HelpersSpec.js
  ---- RequestSpec.js
  ---- PaginatedSpec.js
  --- auth
  ---- ClientSpec.js
  --- print
  ---- PrintMetaSpec.js
  ---- PrintPreparationSpec.js
  ---- PrinterRegistrationSpec.js
  ---- PrinterManagementSpec.js
  ---- PrinterFirmwareSpec.js
  --- drive
  ---- FilesSpec.js
  ---- AssetsSpec.js
  ---- MembersSpec.js
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

#### Constants
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
