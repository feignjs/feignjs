var feign = require("../feign");



var mockClient = {
	requestLog: [],
	request: function(baseUrl, requestOptions, parameters){
		this.requestLog.push({
			baseUrl: baseUrl,
			requestOptions: requestOptions,
			parameters: parameters
		});
		return Promise.resolve();
	},
	
	clear: function(baseUrl, requestOptions, parameters){
		this.requestLog = [];
	}
};



module.exports = {
	setUp: function (callback) {
        mockClient.clear();
        callback();
    },
	testClientCall: function(test){
		var client = feign.builder()
			.client(mockClient)
			.target({getUsers: 'GET /users'}, "http://base/");
		
		client.getUsers()
		.then(function(){
			test.equal(mockClient.requestLog.length, 1, "there should be only one call for one method call");
			var requestData = mockClient.requestLog[0];
			test.equal(requestData.baseUrl, "http://base/");
			test.deepEqual(requestData.parameters, {});
			test.deepEqual(requestData.requestOptions, {method: 'GET', uri:'/users'});
			test.done();
		});
	},
	
	
	testCallbackBasedBuilder: function(test){
		var client = feign.builder({promise:false})
			.client(mockClient)
			.target({getUsers: 'GET /users'}, "http://base/");
		
		client.getUsers(function(err, result){
			test.equal(mockClient.requestLog.length, 1, "there should be only one call for one method call");
			test.done();
		});
	},
};