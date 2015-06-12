# Feign.js
Declarative flexible Restclient-bridge that enables to easily define rest-client 
for node. It is based on the java-implementation of feign [from netflix](https://github.com/Netflix/feign).

`Remark:` this library is not affiliated to netflix

## Overview
Feign.js  allows to define a rest-client api and staying independent of a specific client-implementation.

Clients supported:
* [Request](https://github.com/request/request) (`feignjs-request` [module](https://github.com/feignjs/feignjs-request))
 
 
## Installation
You need to install both feignjs and a client to be used for feign.

```
npm install feignjs
npm install feignjs-<client>
```

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

client.getUser(1).then(console.log)
```
see more examples in the [samples-folder](samples)


## Features:
* path-parameter support ([rfc6570](https://tools.ietf.org/html/rfc6570))
* very flexible api:
 * promise or callback style, however you want it
 * flexible parameters: can be named or unnamed. (`client.getUser(1)` or `client.getUser({id:1})`)
 
 
 ## Options:
 an option-object can be fed into feign.builder() with following options:
 
 | Option | Note | default
|---|---|---|
| promise | crate a promise-based api. false for callback-based api. | true |


