var feign;
(function (feign) {
    feign.cbProxyFactory = function (baseUrl, requestObj) {
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
    feign.promiseProxyFactory = function (baseUrl, requestObj) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return requestObj.executeRequest(baseUrl, args);
        };
    };
})(feign || (feign = {}));
/// <reference path="lib/feign.d.ts" />
var feign;
(function (feign) {
    feign.Args = require("args-js");
    feign.uriTemplate = require("uri-templates");
    feign._ = require("lodash");
    /**
     * creates a feign-builder to build up a rest-client.
     * parameters can be given named as object or unnamed
     * @param {boolean} promise promise or callback api-style
     */
    function builder() {
        var args = feign.Args([
            { promise: feign.Args.BOOL | feign.Args.Optional, _default: true }
        ], arguments);
        var builder = new FeignBuilder();
        builder.proxyFactory(args.promise ? feign.promiseProxyFactory : feign.cbProxyFactory);
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
                var requestObj = new feign.Wrapper(options, this.feignClient, this.requestInterceptors);
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
                var parsedOptions = feign.Args([
                    { method: feign.Args.STRING | feign.Args.Optional, _default: 'GET' },
                    { uri: feign.Args.STRING | feign.Args.Required }
                ], [options]);
                options = { method: parsedOptions.method, uri: parsedOptions.uri };
            }
            return options;
        };
        return FeignBuilder;
    })();
})(feign || (feign = {}));
var feign;
(function (feign) {
    function createDynamicArgsDef(varNames) {
        var resultDef = [];
        for (var i = 0; i < varNames.length; ++i) {
            var def = {};
            def[varNames[i]] = feign.Args.ANY | feign.Args.Required;
            resultDef.push(def);
        }
        return resultDef;
    }
    var Wrapper = (function () {
        function Wrapper(options, client, interceptors) {
            this.options = options;
            this.client = client;
            this.interceptors = interceptors;
            this.options.uri = feign.uriTemplate(this.options.uri);
        }
        Wrapper.prototype.getProcessedUrl = function (request, pathParameters) {
            var template = request.options.uri;
            var newOptions = feign._.omit(request.options, 'uri');
            if (template.varNames.length > 0) {
                //pop before args => otherwise args will screw up parsing
                //parameters where supplied in named style and there is a body
                if (pathParameters.length == 2 && feign._.isPlainObject(pathParameters[0])) {
                    request.parameters = pathParameters.pop();
                }
                else {
                    //parameters where supplied in array and there are more than needed:
                    if (pathParameters.length > template.varNames.length) {
                        request.parameters = pathParameters.pop();
                    }
                }
                var defs = createDynamicArgsDef(template.varNames);
                var params = feign.Args(defs, pathParameters);
                var newUri = template.fill(params);
                newOptions.uri = newUri;
            }
            else {
                newOptions.uri = template.fill();
                //if there are no pathVariables in url, we use pathParameters as parameters for later
                if (pathParameters.length > 0) {
                    request.parameters = pathParameters[0];
                }
            }
            request.options = newOptions;
        };
        Wrapper.prototype.executeRequest = function (baseUrl, callArguments) {
            /*var args = Args([
                  { pathParams: Args.ANY | Args.Optional },
                  { params: Args.ANY | Args.Optional }
                ], callArguments);
                */
            var request = {
                baseUrl: baseUrl,
                options: this.options,
                parameters: null
            };
            this.getProcessedUrl(request, callArguments);
            this.processInterceptors(request);
            return this.client.request(request).then(function (response) {
                return response.body;
            });
        };
        Wrapper.prototype.processInterceptors = function (request) {
            for (var i = 0; i < this.interceptors.length; ++i) {
                this.interceptors[i].apply(request);
            }
        };
        return Wrapper;
    })();
    feign.Wrapper = Wrapper;
})(feign || (feign = {}));
//# sourceMappingURL=feign.js.map