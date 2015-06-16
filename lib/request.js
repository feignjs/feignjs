/// <reference path="es6-promise.d.ts" />
var Args = require("args-js");
var uriTemplate = require("uri-templates");
var _ = require("lodash");
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
//# sourceMappingURL=request.js.map