var feign = require("../feign");



var mockClient = {
  requestLog: [],
  request: function(req){
    this.requestLog.push(req);
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
      test.deepEqual(requestData.parameters, null);
      test.deepEqual(requestData.options, {method: 'GET', uri:'/users'});
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

  testPathParameters: function(test){
    var client = feign.builder()
      .client(mockClient)
      .target({getUser: 'GET /users/{id}'}, "http://base/");

    client.getUser({id: 1})
    .then(function(){
      test.equal(mockClient.requestLog.length, 1, "path parameters should be inserted into url and removed from parameter-object");
      var requestData = mockClient.requestLog[0];
      test.equal(requestData.baseUrl, "http://base/");
      test.deepEqual(requestData.parameters, null);
      test.deepEqual(requestData.options, {method: 'GET', uri:'/users/1'});
      test.done();
    });
  },
};