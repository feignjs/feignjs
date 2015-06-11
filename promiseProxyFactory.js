var Args = require("args-js");

function createProxyFunction(baseUrl, requestObj) {
	return function (parameters) {
		var args = Args([
				{ parameters: Args.OBJECT | Args.Optional, _default: {} }
			], arguments);
		return requestObj.executeRequest(baseUrl, args.parameters);
	};
};

module.exports = createProxyFunction;