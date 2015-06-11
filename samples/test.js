//just for hammering out the api

var feign = require('feignjs')
var FeignRequest = require('feignjs-request');


var restDescription = {
	getUsers: 'GET /users',
	getUser: 'GET /users/{id}',
	createPost: 'POST /posts',
	modifyPost: 'PUT /posts/{id}',
  modifyUserPost: 'PUT /users/{userId}/posts/{postId}'
};


var client = feign.builder()
				.client(new FeignRequest({debug: false}))
        .requestInterceptor({apply:function(req){
          console.log(req.options.method, req.options.uri, "body:", req.parameters);
        }})
				.target(restDescription, 'http://jsonplaceholder.typicode.com');


//GET

//same:
//client.getUser(1)

client.getUser(1, {c: 1})			
.then(console.log)
.catch(console.error);


/*
//POST

 */
client.createPost({
    title: 'foo',
    body: 'bar',
    userId: 1
  })
.then(console.log)
.catch(console.error);



client.modifyPost(1, [{
	  id: 1,
    title: 'foo',
    body: 'bar',
    userId: 1
  }])
.then(console.log)
.catch(console.error);

client.modifyUserPost(1, 1, [{
	  id: 1,
    title: 'foo',
    body: 'bar',
    userId: 1
  }])
.then(console.log)
.catch(console.error);

client.modifyUserPost({userId: 1, postId:1}, [{
	  id: 1,
    title: 'foo',
    body: 'bar',
    userId: 1
  }])
.then(console.log)
.catch(console.error);
