
var Args = require("args-js");
var Request = require("./request");
var promiseProxyFactory = require("./promiseProxyFactory");
var cbProxyFactory = require("./callbackProxyFactory");



function FeignBuilder() {
	this.requestInterceptors = [];
}

FeignBuilder.prototype.client = function (feignClient) {
	this.feignClient = feignClient;
	return this;
};


FeignBuilder.prototype.proxyFactory = function (proxyFactory) {
	this.proxyFactory = proxyFactory;
	return this;
};

FeignBuilder.prototype.requestInterceptor = function (requestInterceptor) {
	this.requestInterceptors.push(requestInterceptor);
	return this;
};


FeignBuilder.prototype.target = function (apiDescription, baseUrl) {
	var api = this._createApi(apiDescription, baseUrl);
	return api;
};




FeignBuilder.prototype._createApi = function (apiDescription, baseUrl) {
	var api = {};
	for (var key in apiDescription) {
		var options = this._getOptionsFromDescription(apiDescription, key);
		var requestObj = new Request(options, this.feignClient, this.requestInterceptors); 
		api[key] = this.proxyFactory(baseUrl, requestObj);
	};
	return api;
};

FeignBuilder.prototype._getOptionsFromDescription = function (apiDescription, key) {
	var options = apiDescription[key];
	
	if (typeof options == 'string' || options instanceof String){
		var methodDefRegex = /(\S+)\s+(\S+)/; 	
		var matches = options.match(methodDefRegex);
		if (matches == null){
			throw new Error("Failed to parse method definition for: " + options);
		}
		options = {
			method: matches[1],
			uri: matches[2]
		};
	} else {
		var parsedOptions = Args([
			{ method: Args.STRING | Args.Optional, _default: 'GET' },
			{ uri: Args.STRING | Args.Required }
		],  [options]);
		options = {method: parsedOptions.method, uri: parsedOptions.uri};
	}
	
	return options;
};








module.exports = {
	builder: function (builderOptions) {
		var args = Args([
			{ promise: Args.BOOL | Args.Optional, _default: true }
		], arguments);
		
		var builder = new FeignBuilder();
		
		builder.proxyFactory(args.promise ? promiseProxyFactory : cbProxyFactory);
		//builder.requestInterceptor(pathParameterInterceptor);
		
		return builder;
	}
};