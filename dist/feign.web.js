(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.feign = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Args = (window.Args);
var _ = (window._);
var uriTemplate = (window.UriTemplate);
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
var feign;
(function (feign) {
    var JsonEncoder = (function () {
        function JsonEncoder() {
        }
        JsonEncoder.prototype.encode = function (body) {
            if (body === null || body === undefined)
                return body;
            return JSON.stringify(body);
        };
        return JsonEncoder;
    })();
    feign.JsonEncoder = JsonEncoder;
    var JsonDecoder = (function () {
        function JsonDecoder() {
        }
        JsonDecoder.prototype.decode = function (body) {
            if (!body || !(typeof (body) === "string"))
                return body;
            try {
                return JSON.parse(body);
            }
            catch (e) {
                throw new Error("Failed to decode json: " + e);
            }
        };
        return JsonDecoder;
    })();
    feign.JsonDecoder = JsonDecoder;
})(feign || (feign = {}));
/// <reference path="lib/feign.d.ts" />
var feign;
(function (feign) {
    /**
     * creates a feign-builder to build up a rest-client.
     * parameters can be given named as object or unnamed
     *
     * @param {boolean} promise promise or callback api-style
     */
    function builder() {
        var args = Args([
            { promise: Args.BOOL | Args.Optional, _default: true }
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
        FeignBuilder.prototype.encoder = function (encoder) {
            this.bodyEncoder = encoder;
            return this;
        };
        FeignBuilder.prototype.decoder = function (decoder) {
            this.bodyDecoder = decoder;
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
                var requestObj = new feign.Wrapper(options, this.feignClient, this.requestInterceptors, this.bodyEncoder, this.bodyDecoder);
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
                //allows to pass on other stuff, e.g. fallback for circuitBreaker
                options = _.clone(apiDescription[key]);
                options.method = parsedOptions.method;
                options.uri = parsedOptions.uri;
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
            def[varNames[i]] = Args.ANY | Args.Required;
            resultDef.push(def);
        }
        return resultDef;
    }
    var Wrapper = (function () {
        function Wrapper(options, client, interceptors, encoder, decoder) {
            this.options = options;
            this.client = client;
            this.interceptors = interceptors;
            this.encoder = encoder;
            this.decoder = decoder;
            this.options.uri = uriTemplate(this.options.uri);
        }
        Wrapper.prototype.getProcessedUrl = function (request, pathParameters) {
            var template = request.options.uri;
            var newOptions = _.omit(request.options, 'uri');
            if (template.varNames.length > 0) {
                //pop before args => otherwise args will screw up parsing
                //parameters where supplied in named style and there is a body
                if (pathParameters.length == 2 && _.isPlainObject(pathParameters[0])) {
                    request.parameters = pathParameters.pop();
                }
                else {
                    //parameters where supplied in array and there are more than needed:
                    if (pathParameters.length > template.varNames.length) {
                        request.parameters = pathParameters.pop();
                    }
                }
                var defs = createDynamicArgsDef(template.varNames);
                var params = Args(defs, pathParameters);
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
            if (this.encoder && request.options.method !== 'GET') {
                request.parameters = this.encoder.encode(request.parameters);
            }
            var _this = this;
            return this.client.request(request).then(function (response) {
                if (_this.decoder) {
                    return _this.decoder.decode(response.body);
                }
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
module.exports = {
    builder: feign.builder,
    JsonEncoder: feign.JsonEncoder,
    JsonDecoder: feign.JsonDecoder
};

},{}]},{},[1])(1)
});