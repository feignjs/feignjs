var feign = require("../lib/feign");
var MockClient = require("./mockClient");



module.exports = {

  testPathParameters: function(test){
    
    var testData = [
      //spec                 arguments,     exp path       exp params
      ['GET /users',         [],            '/users',      null ],
      ['GET /users',         [{}],          '/users',      {} ],
      ['GET /users/{i}',     [{i: 1}],      '/users/1',    null ],
      ['GET /users/{i}',     [{i: 1}, {}],  '/users/1',    {} ],
      ['GET /users/{i}',     [1],           '/users/1',    null ],
      ['GET /users/{i}',     [1, {}],       '/users/1',    {} ],
      ['GET /users/{i}/{u}', [1,2],         '/users/1/2',  null ],
      ['GET /users{/i,u}',   [1,2,[]],      '/users/1/2',  [] ],
      ['GET /users{/i,u}',   [{i:1,u:2}],   '/users/1/2',  null ],
      ['GET /users{/i,u}',   [{i:1,u:2}, []],'/users/1/2', [] ],
    ]
    
    for(var i = 0; i < testData.length; ++i){
      var t = testData[i];
      var verificationClient = new MockClient(null, t[3], {method: 'GET', uri:t[2]}, test);
      verificationClient.title = "Test " + i;
      var client = feign.builder().client(verificationClient).target({testFunction: t[0]}, null);
      client.testFunction.apply(client, t[1]);
    }
    test.done();
  },


};