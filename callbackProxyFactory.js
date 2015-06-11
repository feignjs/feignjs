
function createCbProxyFunction(baseUrl, requestObj) {
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

module.exports = createCbProxyFunction;