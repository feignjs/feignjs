module feign {
  
  export var cbProxyFactory = function (baseUrl: string, requestObj: Wrapper): () => void {
    return function () {
      var args = Array.prototype.slice.call(arguments);
      var callback = args.pop();
      requestObj.executeRequest(baseUrl, args)
        .then(function (result) {
          callback(null, result);
        }, function (error) {
          callback(error, null);
        });
    };
  };
  
  export var promiseProxyFactory = function(baseUrl: string, requestObj: Wrapper): () => Promise<Response> {
    return function () {
      var args = Array.prototype.slice.call(arguments);
      return requestObj.executeRequest(baseUrl, args);
    };
  };
}
