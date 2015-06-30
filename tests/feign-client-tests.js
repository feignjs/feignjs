var feign = require("../dist/feign");
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

 testInterceptors: function(test){
     var verificationClient = new MockClient("http://base/", null, {method: 'GET', uri:'/users'}, test);
     var client = feign.builder()
      .client(verificationClient)
      .requestInterceptor ({
        apply: function(){
          test.done();
        }
      })
      .target({getUsers: 'GET /users'}, "http://base/");

    client.getUsers();
  },
  testDencoders: function(test){
     var verificationClient = new MockClient("http://base/", {id:1}, {method: 'POST', uri:'/users'}, test);
     var client = feign.builder()
      .client(verificationClient)
      .encoder ({
        encode: function(val){
          test.ok(true);
          return val;
        }
      }).decoder ({
        decode: function(val){
          test.ok(true);
          return val;
        }
      })
      .target({setUsers: 'POST /users'}, "http://base/");
      
    test.expect(5); //2 decoders, 3 MockClient
    client.setUsers({id: 1}).then(function(){
      test.done();
    });
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