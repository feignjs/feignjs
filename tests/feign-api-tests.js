var feign = require("../dist/feign");

module.exports = {

  testNormalDefinition: function(test){
    var client = feign.builder()
      .target({
            getUsers: {
              method: 'GET',
              uri: '/test/'
            }
          },
          "http://base/");
    test.equal(typeof client.getUsers, "function", "a function should be created for getUser-desc");
    test.done();
  },

  testSimpleDefinition: function(test){
    var client = feign.builder()
      .target({getUsers: 'GET /users'}, "http://base/");
    test.equal(typeof client.getUsers, "function", "a function should be created for simple stringbased desc");
    test.done();
  }
};