
function Request(options, client, interceptors){
	this.options = options;
	this.client = client;
	this.interceptors = interceptors;
}



Request.prototype.executeRequest =  function (baseUrl, parameters) {
	
	var request = {
		baseUrl: baseUrl,
		options: this.options,
		parameters: parameters
	};
	
	this._processInterceptors(request);
	
	return this.client.request(request);
};


Request.prototype._processInterceptors = function (request) {
	for(var i = 0; i < this.interceptors.length; ++i){
		this.interceptors[i].apply(request);
	}	
};



module.exports = Request;