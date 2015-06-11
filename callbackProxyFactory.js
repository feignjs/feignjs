var Args = require("args-js");


function createCbProxyFunction(baseUrl, requestObj) {
	return function (parameters, callback) {
		var args = Args([
			{ parameters: Args.OBJECT | Args.Optional, _default: {} },
			{ callback: Args.FUNCTION | Args.Required }
		], arguments);
		requestObj.executeRequest(baseUrl, args.parameters)
			.then(function (result) {
				args.callback(null, result);
			}, function (error) {
				args.callback(error, null);
			});
	};
};

module.exports = createCbProxyFunction;