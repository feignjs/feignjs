/// <reference path="lib/feign.d.ts" />


module feign {

  export var Args = require("args-js");
  export var uriTemplate = require("uri-templates");
  export var _ = require("lodash");
  
  
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
    builder.proxyFactory(args.promise ? promiseProxyFactory : cbProxyFactory);
    //builder.requestInterceptor(pathParameterInterceptor);
  
    return builder;
  }

  interface ProxyFactory {
    (baseUrl: String, request: Wrapper): () => any;
  }


  class FeignBuilder {
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



