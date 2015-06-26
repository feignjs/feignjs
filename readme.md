# Feign.js [![Build Status](https://travis-ci.org/feignjs/feignjs.svg)](https://travis-ci.org/feignjs/feignjs) [![Coverage](https://img.shields.io/codecov/c/github/feignjs/feignjs.svg?style=flat-square)](https://codecov.io/github/feignjs/feignjs?branch=master)
Declarative flexible Restclient-bridge that enables to easily define rest-client 
for node. It is based on the java-implementation of feign [from netflix](https://github.com/Netflix/feign).

`Remark:` this library is not affiliated to netflix

## Overview
Feign.js  allows to define a rest-client api and staying independent of a specific client-implementation.

Clients supported:
* [Request](https://github.com/request/request) ([`feignjs-request`](https://github.com/feignjs/feignjs-request) module for node)
* [JQuery](https://jquery.com/) ([`feignjs-jquery`](https://github.com/feignjs/feignjs-jquery) module for node or bower)
* Node([`feignjs-node`](https://github.com/feignjs/feignjs-node)  module using `http`-module of node)
* Xhr([`feignjs-xhr`](https://github.com/feignjs/feignjs-node)  module using plain xhr in browser)
 
 
## Installation
You need to install both feignjs and a client to be used for feign.

```
npm install feignjs
npm install feignjs-<client>
```

or with bower

```
bower install feignjs
bower install feignjs-<client>
```

## Features:
* path-parameter support ([rfc6570](https://tools.ietf.org/html/rfc6570))
* very flexible api:
 * promise or callback style, however you want it
 * flexible parameters: can be named or unnamed. (`client.getUser(1)` or `client.getUser({id:1})`)
 
## Getting started
Similar to [Feign](https://github.com/Netflix/feign), the api will be described 
declaratively and then reflectively instantiated.

```javascript
var apiDescription = {
  getUsers: 'GET /users',
  getUser: 'GET /users/{id}',
  createPost: 'POST /posts',
  modifyPost: 'PUT /posts/{id}',
};

var client = feign.builder()
        .client(new FeignRequest())        
        .target(apiDescription, 'http://jsonplaceholder.typicode.com');

        
client.modifyPost(1, {content: 'new text'}).then(console.log)
```
see more examples in the [samples-folder](samples)

## Format
The description of clients is mostly intuitive. it can be given as plain string or object.
 The format supports uri-templates based on ([rfc6570](https://tools.ietf.org/html/rfc6570)), so you can even use more complicate formats:

```javascript
var apiDescription = {
  getUsers: 'GET /users',
  getUser: 'GET /users/{id}',
  getPosts: 'POST /posts{?count,order}',
  modifyPost: {
    method: 'PUT',
    uri: '/posts{/id}'
  }
  
};
```


## Usage
The generated client contains methods to call the described api-endpoints. 
Depending on the Http-method and the path-parameters the format will vary. 
```
client.method([path-parameters], [body/query/post-parameter-object], [callback-function]);
```
* Path-parameters can be comma-separated or an object with named parameters
* parameter-object: the object after path-parameters will be used as body or query-parameter object, depending on your configuration. 
path-parameters means here all parameters that are used in the uri-template.
* callback-function: if you configured the builder to use callback-style, then the last parameter will be used as callback function of format `function(error, result)`

Some examples:
```javascript
//GET /users/{id}
client.getUser(1)
client.getUser({id: 1})

//PUT /posts/{id}
client.modifyPost(1, newPost);
client.modifyPost({id: 1}, newPost);
//or if you configured callbacks:
client.modifyPost({id: 1}, newPost, onResult);

//POST /posts{?count,order}
client.getPosts({count: 10, order: 'ASC'});

```

 
 ## Options:
 an option-object can be fed into feign.builder() with following options:
 
| Option | Note | default
|---|---|---|
| promise | crate a promise-based api. false for callback-based api. | true |


## Extension
//TODO
* Request Interceptors
* custom clients