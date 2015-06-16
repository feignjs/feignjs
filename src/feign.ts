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
import Args = require('args-js');
import proxyFactories = require('./proxyFactories')
import Request = require('./Request')

module feign {

  /**
   * creates a feign-builder to build up a rest-client.
   * parameters can be given named as object or unnamed
   * @param {boolean} promise promise or callback api-style
   */
  export function builder(): FeignBuilder {
    var args = Args([
      { promise: Args.BOOL | Args.Optional, _default: true }
    ], arguments);

    var builder = new FeignBuilder();
    builder.proxyFactory(args.promise ? proxyFactories.promise : proxyFactories.callback);
    //builder.requestInterceptor(pathParameterInterceptor);
  
    return builder;
  }

  interface ProxyFactory {
    (baseUrl: String, request: Request.Wrapper): () => any;
  }


  class FeignBuilder {
    private requestInterceptors: Request.Interceptor[];
    private proxyMethodFactory: ProxyFactory;
    private feignClient: Request.FeignClient;

    constructor() {
      this.requestInterceptors = [];
    }

    client(feignClient: Request.FeignClient): FeignBuilder {
      this.feignClient = feignClient;
      return this;
    }

    proxyFactory(proxyFactory: ProxyFactory): FeignBuilder {
      this.proxyMethodFactory = proxyFactory;
      return this;
    }

    requestInterceptor(requestInterceptor: Request.Interceptor): FeignBuilder {
      this.requestInterceptors.push(requestInterceptor);
      return this;
    }

    target(apiDescription: any, baseUrl: string): any {
      var api = this.createApi(apiDescription, baseUrl);
      return api;
    }

    private createApi(apiDescription: any, baseUrl: string): any {
      var api = {};
      for (var key in apiDescription) {
        var options = this.getOptionsFromDescription(apiDescription, key);
        var requestObj = new Request.Wrapper(options, this.feignClient, this.requestInterceptors);
        api[key] = this.proxyMethodFactory(baseUrl, requestObj);
      };
      return api;
    }

    private getOptionsFromDescription(apiDescription: any, key: string): Request.Options {
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
      } else {
        var parsedOptions = Args([
          { method: Args.STRING | Args.Optional, _default: 'GET' },
          { uri: Args.STRING | Args.Required }
        ], [options]);
        options = { method: parsedOptions.method, uri: parsedOptions.uri };
      }

      return options;
    }

  }

}


export = feign;
