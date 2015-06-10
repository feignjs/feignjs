//just for hammering out the api

var feign = require('feignjs')
var FeignRequest = require('feignjs-request');


var restDescription = {
	getUsers: 'GET /users',
	getUser: 'GET /users/{id}',
};


var client = feign.builder()
				.client(new FeignRequest())
				.target(restDescription, 'http://jsonplaceholder.typicode.com');
				
client.getUser({id: 1})
.then(console.log)
.catch(console.error);


