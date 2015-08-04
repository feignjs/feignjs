//just for hammering out the api

var feign = require('feignjs')
var FeignRequest = require('feignjs-request');
var FeignJQuery = require('feignjs-jquery');


var restDescription = {
  getUsers: 'GET /users',
  getUser: 'GET /users/{id}',
  getUserC: 'GET /users/{id}{?c}',
  createPost: 'POST /posts',
  modifyPost: 'PUT /posts/{id}',
  modifyUserPost: 'PUT /users/{userId}/posts/{postId}'
};




var client = feign.builder()
        .client(new FeignJQuery({debug: false}))
        .requestInterceptor({apply:function(req){
          console.log(req.options.method, req.options.uri, "body:", req.parameters);
        }})
        .target(restDescription, 'http://jsonplaceholder.typicode.com');


//GET

//same:
//client.getUser({id:1}, {c: 1})

client.getUser(1, {c: 1})
.then(function(r){
  console.log(r);
  return client.getUserC({c:1, id:1}, {e:6});
}).then(function(r){
  console.log(r);
  return client.createPost({
    title: 'foo',
    body: 'bar',
    userId: 1
  });
}).then(function(r){
  console.log(r);
  return client.modifyPost(1, [{
    id: 155,
    title: 'foo',
    body: 'bar',
    userId: 1
  }])
}).then(function(r){
  console.log(r);
  return client.modifyUserPost({userId: 1, postId:1}, [{
    id: 1,
    title: 'foo',
    body: 'bar',
    userId: 1
  }]) 
})
.catch(console.error)
.then(function(r){
  return client.modifyUserPost(1, 1, [{
    id: 1,
    title: 'foo',
    body: 'bar',
    userId: 1
  }]);
})
.catch(console.error);
