function MockClient(baseUrl, parameters, options, test){
  this.baseUrl = baseUrl;
  this.parameters = parameters;
  this.options = options;
  this.test = test;
  this.title = "";
} 

MockClient.prototype.request = function(requestData){
  try{
    this.test.equal(requestData.baseUrl, this.baseUrl, "baseurl is not equal (" + this.title + ")");
    this.test.deepEqual(requestData.parameters, this.parameters, "expected parameters are not equal (" + this.title + ")");
    this.test.deepEqual(requestData.options, this.options, "options are not equal (" + this.title + ")");
    return Promise.resolve({raw:{}, body:{}});
  } catch (e){
    return Promise.reject(e);
  }
};


module.exports = MockClient;