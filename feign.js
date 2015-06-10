
var Args = require("args-js")

function FeignBuilder() {
}

FeignBuilder.prototype.client = function (feignClient) {
	this.feignClient = feignClient;
	return this;
};


FeignBuilder.prototype.target = function (apiDescription, baseUrl) {
	var api = this._createApi(apiDescription, baseUrl);
	return api;
};


FeignBuilder.prototype._createProxyFunction = function (baseUrl, options, client) {
	return function (parameters) {
		return client.request(baseUrl, options, parameters || {});
	};
};

FeignBuilder.prototype._createApi = function (apiDescription, baseUrl) {
	var api = {};
	for (var key in apiDescription) {
		var options = this._getOptionsFromDescription(apiDescription, key);
		api[key] = this._createProxyFunction(baseUrl, options, this.feignClient);
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

function FeignCallbackBasedBuilder() {
}

FeignCallbackBasedBuilder.prototype = new FeignBuilder();
FeignCallbackBasedBuilder.prototype._createProxyFunction = function (baseUrl, options, client) {
	return function (parameters, callback) {
		var args = Args([
			{ parameters: Args.OBJECT | Args.Optional, _default: {} },
			{ callback: Args.FUNCTION | Args.Required }
		], arguments);
		client.request(baseUrl, options, args.parameters)
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

		if (args.promise) {
			return new FeignBuilder();
		} else {
			return new FeignCallbackBasedBuilder();
		}
	}
};