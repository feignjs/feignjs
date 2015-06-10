var uriTemplate = require("uri-templates")
var _ = require("lodash")

module.exports = {
	apply: function(request){
		var template = uriTemplate(request.options.uri);
		
		if (template.varNames.length > 0 ){
			var newUri = template.fill(request.parameters);
			request.options.uri = newUri;
			request.parameters = _.omit(request.parameters, template.varNames);
		}
	}
};