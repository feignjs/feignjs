//this testsuite tests, if clients all work like the same

var assert = require("assert")
var _ = require("lodash");
var feign = require('feignjs')

//var client = new (require('feignjs-request'))();
//var client = new (require('feignjs-jquery'))({defaults: {contentType: "application/json; charset=utf-8", dataType: 'json'}});
var client = new (require('feignjs-node'))({defaults: {headers:{'Content-Type': 'application/json'}}});


var data = require('./data');

function startServer(){
  var jsonServer = require('json-server')
  var server = jsonServer.create();
  server.use(jsonServer.defaults);
  var router = jsonServer.router(data);
  server.use(router);
  server.listen(3000);
}


var restDescription = {
  getUsers: {
    method: 'GET',
    uri: '/users',
    parameters:[],
    expected: data.users
  },
  getUser: {
    method: 'GET',
    uri: '/users/{id}',
    parameters:[1],
    expected: data.users[0]
  },
  getPostsOfUser: {
    method: 'GET',
    uri: '/posts',
    parameters:[{userId: 1}],
    expected: _.where(data.posts, {userId: 1})
  },
  getCommentsOfPost: {
    method: 'GET',
    uri: '/comments{?postId}',
    parameters:[{postId: 1}],
    expected: _.where(data.comments, {postId: 1})
  },
  createPost: {
    method: 'POST',
    uri: '/posts',
    parameters:[{
      "userId": 2,
      "title": "title",
      "body": "body"
    }],
    expected: {
      "userId": 2,
      "title": "title",
      "body": "body",
      id: 101
    }
  },
  changePost: {
    method: 'PUT',
    uri: '/posts/{id}',
    parameters:[98, {
      "userId": 2,
      "title": "title",
      "body": "body"
    }],
    expected: {
      "userId": 2,
      "title": "title",
      "body": "body",
      id: 98
    }
  },
  deletePost: {
    method: 'DELETE',
    uri: '/posts/{id}',
    parameters:[97],
    expected: {}
  },
  
};

startServer();

var restClient = feign.builder()
        .client(client)
        .decoder(new feign.JsonDecoder())
        .encoder(new feign.JsonEncoder())
        .target(restDescription, 'http://localhost:3000');

function errorHandler(name){
  return function onError(err){
    console.log("Error in " + name + ": ", err.stack);
    
  };
}

function okHandler(name){
  return function onError(err){
    console.log(name + ": OK");
  };
}

function getAssertFn(expected){
  return function (actual){
    assert.deepEqual(actual, expected);
  }
}

var allPromises = []; 
for(var m in restDescription){
  var r = restDescription[m];
  var p = restClient[m].apply(client, r.parameters)
  .then(getAssertFn(r.expected))
  .then(okHandler(r.method + " " + r.uri), errorHandler(m + "(" + r.uri + ")"));
  allPromises.push(p);
}

Promise.all(allPromises).then(function(){
  process.exit();
});

