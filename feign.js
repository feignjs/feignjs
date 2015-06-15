/**
* Declarative Rest Client Api.
* 
* 
* 
  @module feign
*/
 

/**
 * @overview Internal types:
 * 
 * ####Request 
 * ```javascript
{
  baseUrl: 'http://localhost/',
  options: {method: 'GET', uri: '/bla'},
  parameters: {}
};
 * ```
 * 
 * ####Response 
 * ```javascript
{
  raw: {},
  body: ...
};
 * ```
 * 
 */

var Args = require("args-js");
var Request = require("./request");
var promiseProxyFactory = require("./promiseProxyFactory");
var cbProxyFactory = require("./callbackProxyFactory");



function FeignBuilder() {
  this.requestInterceptors = [];
}



module.exports = {
  /**
   * creates a feign-builder to build up a rest-client.
   * parameters can be given named as object or unnamed
   * @param {boolean} promise promise or callback api-style
   */
  builder: function () {
    var args = Args([
      { promise: Args.BOOL | Args.Optional, _default: true }
    ], arguments);

    var builder = new FeignBuilder();

    builder.proxyFactory(args.promise ? promiseProxyFactory : cbProxyFactory);
    //builder.requestInterceptor(pathParameterInterceptor);

    return builder;
  }
};

/**
 * sets the client to be used for ajax-requests. 
 * A client has a very simlpe API and can be implemented very easily.
 * It accepts a [request](#request)-Object and returns a **promise** that contains the [response](#response).
 * 
 * ```javascript
 * {
 *   request: function(request){
 *      
 *   }
 * }
 * ```
 * 
 * @param feignClient {object} a client that translates a feign-request to some thirdparty library
 */
FeignBuilder.prototype.client = function (feignClient) {
  this.feignClient = feignClient;
  return this;
};


FeignBuilder.prototype.proxyFactory = function (proxyFactory) {
  this.proxyFactory = proxyFactory;
  return this;
};

/**
 * adds a request interceptor that will be called with the [request](#request), so it can be altered or logged
 * 
 * A request interceptor looks like that:
 * ```javascript
 * {
 *   apply: function(request){
 *      
 *   }
 * }
 * ```
 * 
 * @param requestInterceptor {object} an interceptor
 */
FeignBuilder.prototype.requestInterceptor = function (requestInterceptor) {
  this.requestInterceptors.push(requestInterceptor);
  return this;
};


/**
 * crates the client based on the given api-description and baseUrl
 * @param {object} apiDescription
 * @param {string} baseUrl  
 */
FeignBuilder.prototype.target = function (apiDescription, baseUrl) {
  var api = this._createApi(apiDescription, baseUrl);
  return api;
};




FeignBuilder.prototype._createApi = function (apiDescription, baseUrl) {
  var api = {};
  for (var key in apiDescription) {
    var options = this._getOptionsFromDescription(apiDescription, key);
    var requestObj = new Request(options, this.feignClient, this.requestInterceptors);
    api[key] = this.proxyFactory(baseUrl, requestObj);
  };
  return api;
};

FeignBuilder.prototype._getOptionsFromDescription = function (apiDescription, key) {
  var options = apiDescription[key];

  if (typeof options == 'string' || options instanceof String){
    var methodDefRegex = /(\S+)\s+(\S+)/;
    var matches = options.match(methodDefRegex);
    if (matches == null){
      throw new Error("Failed to parse method definition for: " + options);
    }
    options = {
      method: matches[1],
      uri: matches[2]
    };
  } else {
    var parsedOptions = Args([
      { method: Args.STRING | Args.Optional, _default: 'GET' },
      { uri: Args.STRING | Args.Required }
    ],  [options]);
    options = {method: parsedOptions.method, uri: parsedOptions.uri};
  }

  return options;
};






