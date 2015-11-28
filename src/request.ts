
  
module feign {  
  

  
  function createDynamicArgsDef(varNames){
    var resultDef = [];
    for(var i = 0; i < varNames.length; ++i){
      var def = {};
      def[varNames[i]] =  Args.ANY | Args.Required;
      resultDef.push(def);
    }
    return resultDef;
  }
  
  export interface FeignClient {
    request(description: RequestDescription): Promise<Response>;
  }
    
    
  export interface RequestDescription {
      baseUrl: string;
      options: Options;
      parameters: any[];
  }
  
  export interface Response {
    raw: any;
    body: any;
  }
  
  export interface Options {
      method: string;
      uri: any;
  }
  
  export interface Interceptor {
    apply(description: RequestDescription): void
  }
  
 
  
  export class Wrapper {
    
    
    constructor(public options: Options,
                private client, 
                private interceptors: Interceptor[],
                private encoder: Encoder,
                private decoder: Decoder){
      this.options.uri = uriTemplate(this.options.uri);
    }
    
    private getProcessedUrl(request: RequestDescription, pathParameters: any[]) {
      var template = request.options.uri;
      var newOptions = <Options>_.omit(request.options, 'uri');
    
      if (template.varNames.length > 0 ){
        //pop before args => otherwise args will screw up parsing
        
        //parameters where supplied in named style and there is a body
        if (pathParameters.length == 2 && _.isPlainObject(pathParameters[0])){
          request.parameters = pathParameters.pop();
        } else {
          //parameters where supplied in array and there are more than needed:
          if (pathParameters.length > template.varNames.length){
             request.parameters = pathParameters.pop();
          }
        }
        var defs = createDynamicArgsDef(template.varNames);
        var params = Args(defs,pathParameters);
        var newUri = template.fill(params);
        newOptions.uri = newUri;
      } else {
        newOptions.uri = template.fill();
        //if there are no pathVariables in url, we use pathParameters as parameters for later
        if (pathParameters.length > 0){
          request.parameters = pathParameters[0];
        }
      }
      request.options = newOptions;
    }
    
    executeRequest(baseUrl: string, callArguments: any[]): Promise<any> {
    
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
    
      this.getProcessedUrl(request, callArguments)
    
      this.processInterceptors(request);
      
      if (this.encoder && request.options.method !== 'GET'){
        request.parameters = this.encoder.encode(request.parameters);
      }
      var _this = this;
      return this.client.request(request).then(function(response: Response){
          if (_this.decoder){
            return _this.decoder.decode(response.body);
          }
          return response.body;
      });
    }
    
    
    private processInterceptors(request: RequestDescription) {
      for(var i = 0; i < this.interceptors.length; ++i){
        this.interceptors[i].apply(request);
      }
    }
  
  }
}


