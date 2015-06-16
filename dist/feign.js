(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.feign = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/// <reference path="es6-promise.d.ts" />
var Args = (window.Args);
var uriTemplate = (window.UriTemplate);
var _ = (window._);
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
    function Wrapper(options, client, interceptors) {
        this.options = options;
        this.client = client;
        this.interceptors = interceptors;
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
exports.Wrapper = Wrapper;

},{}],2:[function(require,module,exports){
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
module.exports = cbProxyFactory;

},{}],3:[function(require,module,exports){
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
var Args = (window.Args);
var cbProxyFactory = require('./callbackProxyFactory');
var promiseProxyFactory = require('./promiseProxyFactory');
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
        builder.proxyFactory(args.promise ? promiseProxyFactory : cbProxyFactory);
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
        ;
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
        ;
        return FeignBuilder;
    })();
})(feign || (feign = {}));
module.exports = feign;

},{"./Request":1,"./callbackProxyFactory":2,"./promiseProxyFactory":4}],4:[function(require,module,exports){
function promiseProxyFactory(baseUrl, requestObj) {
    return function () {
        var args = Array.prototype.slice.call(arguments);
        return requestObj.executeRequest(baseUrl, args);
    };
}
;
module.exports = promiseProxyFactory;

},{}]},{},[3])(3)
});