//just for hammering out the api

var feign = require('feignjs')
var FeignRequest = require('feignjs-request');


var restDescription = {
	getUsers: 'GET /users'
};


var client = feign.builder()
				.client(new FeignRequest())
				.target(restDescription, 'http://jsonplaceholder.typicode.com');
				
client.getUsers()
.then(console.log)
.catch(console.error);


