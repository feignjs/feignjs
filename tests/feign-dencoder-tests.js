var feign = require("../dist/feign");

module.exports = {

  testEncoder: function(test){
    var encoder = new feign.JsonEncoder();
	
      var strVal = encoder.encode({id: 1});
    test.equal(strVal, '{"id":1}');
    test.done();
  },

   testDecoder: function(test){
    var decoder = new feign.JsonDecoder();
	
    var obj = decoder.decode('{"id":1}');
    test.deepEqual(obj, {id: 1});
    test.done();
  },
};