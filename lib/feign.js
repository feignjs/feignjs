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
var Args = require('args-js');
var proxyFactories = require('./proxyFactories');
var Request = require('./Request');
var feign;
(function (feign) {
    /**
     * creates a feign-builder to build up a rest-client.
     * parameters can be given named as object or unnamed
     * @param {boolean} promise promise or callback api-style
     */
    function builder() {
        var args = Args([
            { promise: Args.BOOL | Args.Optional, _default: true }
        ], arguments);
        var builder = new FeignBuilder();
        builder.proxyFactory(args.promise ? proxyFactories.promise : proxyFactories.callback);
        //builder.requestInterceptor(pathParameterInterceptor);
        return builder;
    }
    feign.builder = builder;
    var FeignBuilder = (function () {
        function FeignBuilder() {
            this.requestInterceptors = [];
        }
        FeignBuilder.prototype.client = function (feignClient) {
            this.feignClient = feignClient;
            return this;
        };
        FeignBuilder.prototype.proxyFactory = function (proxyFactory) {
            this.proxyMethodFactory = proxyFactory;
            return this;
        };
        FeignBuilder.prototype.requestInterceptor = function (requestInterceptor) {
            this.requestInterceptors.push(requestInterceptor);
            return this;
        };
        FeignBuilder.prototype.target = function (apiDescription, baseUrl) {
            var api = this.createApi(apiDescription, baseUrl);
            return api;
        };
        FeignBuilder.prototype.createApi = function (apiDescription, baseUrl) {
            var api = {};
            for (var key in apiDescription) {
                var options = this.getOptionsFromDescription(apiDescription, key);
                var requestObj = new Request.Wrapper(options, this.feignClient, this.requestInterceptors);
                api[key] = this.proxyMethodFactory(baseUrl, requestObj);
            }
            ;
            return api;
        };
        FeignBuilder.prototype.getOptionsFromDescription = function (apiDescription, key) {
            var options = apiDescription[key];
            if (typeof options == 'string' || options instanceof String) {
                var methodDefRegex = /(\S+)\s+(\S+)/;
                var matches = options.match(methodDefRegex);
                if (matches == null) {
                    throw new Error("Failed to parse method definition for: " + options);
                }
                options = {
                    method: matches[1],
                    uri: matches[2]
                };
            }
            else {
                var parsedOptions = Args([
                    { method: Args.STRING | Args.Optional, _default: 'GET' },
                    { uri: Args.STRING | Args.Required }
                ], [options]);
                options = { method: parsedOptions.method, uri: parsedOptions.uri };
            }
            return options;
        };
        return FeignBuilder;
    })();
})(feign || (feign = {}));
module.exports = feign;
//# sourceMappingURL=feign.js.map