/// <reference path="lib/feign.d.ts" />

module feign {

  /**
   * a proxyfactory is a function taking the configured baseUrl and Wrapper-object 
   * and return a function which will end up in the rest-client-object, defining the api and 
   * behaviour of the feign-created client.
   */
  export interface ProxyFactory {
    (baseUrl: String, request: Wrapper): () => any;
  }
  
  /**
   * the fluent builder interface for feign-clients
   */
  export interface IFeignBuilder {
    /**
     * set a client to be used for making http-requests
     */
     client(feignClient: FeignClient): IFeignBuilder
     
     /**
      * sets the proxy factory to be used. 
      * This will normaly be initiated by builder() itself, so 
      * you dont normaly have to call this except if you want to 
      * extend its behaviour
      */
     proxyFactory(proxyFactory: ProxyFactory): IFeignBuilder
     
     /**
      * adds a request interceptor that will be called just before handing the
      * request to the registered FeignClient
      */
     requestInterceptor(requestInterceptor: Interceptor): IFeignBuilder
     
     /**
      * sets the baseUrl and apiDescription with which the 
      * client should be generated
      * 
      * @return the generated client-object
      */
     target(apiDescription: any, baseUrl: string): any
  }
  
  /**
   * creates a feign-builder to build up a rest-client.
   * parameters can be given named as object or unnamed
   * 
   * @param {boolean} promise promise or callback api-style
   */
  export function builder(): IFeignBuilder {
    var args = Args([
      { promise: Args.BOOL | Args.Optional, _default: true }
    ], arguments);

    var builder = new FeignBuilder();
    builder.proxyFactory(args.promise ? promiseProxyFactory : cbProxyFactory);
    //builder.requestInterceptor(pathParameterInterceptor);
  
    return builder;
  }




  class FeignBuilder implements IFeignBuilder {
    private requestInterceptors: Interceptor[];
    private proxyMethodFactory: ProxyFactory;
    private feignClient: FeignClient;

    constructor() {
      this.requestInterceptors = [];
    }

    client(feignClient: FeignClient): FeignBuilder {
      this.feignClient = feignClient;
      return this;
    }

    proxyFactory(proxyFactory: ProxyFactory): FeignBuilder {
      this.proxyMethodFactory = proxyFactory;
      return this;
    }

    requestInterceptor(requestInterceptor: Interceptor): FeignBuilder {
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
        var requestObj = new Wrapper(options, this.feignClient, this.requestInterceptors);
        api[key] = this.proxyMethodFactory(baseUrl, requestObj);
      };
      return api;
    }

    private getOptionsFromDescription(apiDescription: any, key: string): Options {
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



