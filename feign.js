
var Args = require("args-js");
var pathParameterInterceptor = require("./pathParameter");

function FeignBuilder() {
	this.requestInterceptors = [];
}

FeignBuilder.prototype.client = function (feignClient) {
	this.feignClient = feignClient;
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


FeignBuilder.prototype._createProxyFunction = function (baseUrl, options) {
	var _this = this;
	return function (parameters) {
		var args = Args([
				{ parameters: Args.OBJECT | Args.Optional, _default: {} }
			], arguments);
		return _this._executeRequest(baseUrl, options, args.parameters);
		
	};
};

FeignBuilder.prototype._createApi = function (apiDescription, baseUrl) {
	var api = {};
	for (var key in apiDescription) {
		var options = this._getOptionsFromDescription(apiDescription, key);
		api[key] = this._createProxyFunction(baseUrl, options);
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
		
	}
	
	return options;
};

FeignBuilder.prototype._executeRequest = function (baseUrl, options, parameters) {
	
	var request = {
		baseUrl: baseUrl,
		options: options,
		parameters: parameters
	};
	
	this._processInterceptors(request);
	
	return this.feignClient.request(request);
}

FeignBuilder.prototype._processInterceptors = function (request) {
	for(var i = 0; i < this.requestInterceptors.length; ++i){
		this.requestInterceptors[i].apply(request);
	}	
}

function FeignCallbackBasedBuilder() {
}

FeignCallbackBasedBuilder.prototype = new FeignBuilder();
FeignCallbackBasedBuilder.prototype._createProxyFunction = function (baseUrl, options) {
	var _this = this;
	return function (parameters, callback) {
		var args = Args([
			{ parameters: Args.OBJECT | Args.Optional, _default: {} },
			{ callback: Args.FUNCTION | Args.Required }
		], arguments);
		_this._executeRequest(baseUrl, options, args.parameters)
			.then(function (result) {
				args.callback(null, result);
			}, function (error) {
				args.callback(error, null);
			});
	};
};



module.exports = {
	builder: function (builderOptions) {
		var args = Args([
			{ promise: Args.BOOL | Args.Optional, _default: true }
		], arguments);
		
		var builder = null;
		if (args.promise) {
			builder = new FeignBuilder();
		} else {
			builder = new FeignCallbackBasedBuilder();
		}
		
		builder.requestInterceptor(pathParameterInterceptor)
		
		return builder;
	}
};