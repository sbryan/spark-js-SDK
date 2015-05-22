### Spark JavaScript SDK

This is a prototype client side SDK for the Spark REST APIs, providing:

* A convenient interface for application developers.
* An abstract layer for the Spark APIs.
* High-level functionality by chaining/callbacking APIs together.

### Installing everything

Install Node.js and then:

```sh
$ sudo npm -g install grunt-cli karma bower
$ npm install
$ bower install
```
### Grunt tasks that are provided in this SDK
#### Testing ####
```sh
$ grunt test
```
#### Hinting ####
```sh
$ grunt jshint
```
#### Building ####
```sh
$ grunt build
```
or

```sh
$ grunt build:[version]
```
Where version might be any string.

#### Generate documentation
```sh
$ grunt docs
```
