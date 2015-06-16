function promiseProxyFactory(baseUrl, requestObj) {
    return function () {
        var args = Array.prototype.slice.call(arguments);
        return requestObj.executeRequest(baseUrl, args);
    };
}
;
module.exports = promiseProxyFactory;
//# sourceMappingURL=promiseProxyFactory.js.map