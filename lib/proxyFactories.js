function cbProxyFactory(baseUrl, requestObj) {
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
}
;
function promiseProxyFactory(baseUrl, requestObj) {
    return function () {
        var args = Array.prototype.slice.call(arguments);
        return requestObj.executeRequest(baseUrl, args);
    };
}
;
module.exports = {
    callback: cbProxyFactory,
    promise: promiseProxyFactory
};
//# sourceMappingURL=proxyFactories.js.map