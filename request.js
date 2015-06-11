var Args = require("args-js");
var uriTemplate = require("uri-templates")
var _ = require("lodash")

function createDynamicArgsDef(varNames){
  var resultDef = [];
  for(var i = 0; i < varNames.length; ++i){
    var def = {};
    def[varNames[i]] =  Args.ANY | Args.Required;
    resultDef.push(def);
  }
  return resultDef;
}




function Request(options, client, interceptors){
  this.options = options;
  this.client = client;
  this.interceptors = interceptors;

  this.options.uri = uriTemplate(this.options.uri);
}

Request.prototype._getProcessedUrl = function(request){
  var template = request.options.uri;
  var newOptions = _.omit(request.options, 'uri');

  if (template.varNames.length > 0 ){
    var defs = createDynamicArgsDef(template.varNames);
    var params = Args(defs,request.pathParameters);
    var newUri = template.fill(params);
    newOptions.uri = newUri;
  } else {
    newOptions.uri = template.fill();
    //if there are no pathVariables in url, we use pathParameters as parameters for later
    if (request.pathParameters !== null){
      request.parameters = request.pathParameters[0];
      request.pathParameters = null;
    }
  }
  request.options = newOptions;
};

Request.prototype.executeRequest =  function (baseUrl, callArguments) {

  /*var args = Args([
        { pathParams: Args.ANY | Args.Optional },
        { params: Args.ANY | Args.Optional }
      ], callArguments);
      */

  var pathParams = null;
  var params = null;
  if (callArguments.length > 0){
    if (callArguments.length > 1){
      params = callArguments.pop();
    }

    pathParams = callArguments;
  }


  var request = {
    baseUrl: baseUrl,
    options: this.options,
    pathParameters: pathParams,
    parameters: params
  };

  this._getProcessedUrl(request)

  this._processInterceptors(request);

  return this.client.request(request);
};


Request.prototype._processInterceptors = function (request) {
  for(var i = 0; i < this.interceptors.length; ++i){
    this.interceptors[i].apply(request);
  }
};



module.exports = Request;