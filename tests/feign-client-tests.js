var feign = require("../lib/feign");
var MockClient = require("./mockClient");


module.exports = {

  testClientCall: function(test){
    
    var verificationClient = new MockClient("http://base/", null, {method: 'GET', uri:'/users'}, test);
    
    var client = feign.builder()
      .client(verificationClient)
      .target({getUsers: 'GET /users'}, "http://base/");

    client.getUsers()
    .then(function(){
      test.done();
    }, console.error);
  },


  testCallbackBasedBuilder: function(test){
     var verificationClient = new MockClient("http://base/", null, {method: 'GET', uri:'/users'}, test);
     var client = feign.builder({promise:false})
      .client(verificationClient)
      .target({getUsers: 'GET /users'}, "http://base/");

    client.getUsers(function(err, result){
      test.equal(err, null);
      test.done();
    });
  },

  testPathParameters: function(test){
    var verificationClient = new MockClient("http://base/", null, {method: 'GET', uri:'/users/1'}, test);
    var client = feign.builder()
      .client(verificationClient)
      .target({getUser: 'GET /users/{id}'}, "http://base/");

    client.getUser({id: 1})
    .then(function(){
      test.done();
    }, console.error);
  },
  
  
  
  
};