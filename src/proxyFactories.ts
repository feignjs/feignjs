import Request = require('./request');

function cbProxyFactory(baseUrl: string, requestObj: Request.Wrapper): () => void {
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

function promiseProxyFactory(baseUrl: string, requestObj: Request.Wrapper): () => Promise<Request.Response> {
  return function () {
    var args = Array.prototype.slice.call(arguments);
    return requestObj.executeRequest(baseUrl, args);
  };
};

export = {
  callback: cbProxyFactory,
  promise: promiseProxyFactory
};