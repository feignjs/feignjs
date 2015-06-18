/// <reference path="../src/lib/feign.d.ts" />
declare var Args: Args.ArgsStatic;
declare var _: _.LoDashStatic;
declare var uriTemplate: any;
declare module feign {
    var cbProxyFactory: (baseUrl: string, requestObj: Wrapper) => () => void;
    var promiseProxyFactory: (baseUrl: string, requestObj: Wrapper) => () => Promise<Response>;
}
declare module feign {
    /**
     * a proxyfactory is a function taking the configured baseUrl and Wrapper-object
     * and return a function which will end up in the rest-client-object, defining the api and
     * behaviour of the feign-created client.
     */
    interface ProxyFactory {
        (baseUrl: String, request: Wrapper): () => any;
    }
    /**
     * the fluent builder interface for feign-clients
     */
    interface IFeignBuilder {
        /**
         * set a client to be used for making http-requests
         */
        client(feignClient: FeignClient): IFeignBuilder;
        /**
         * sets the proxy factory to be used.
         * This will normaly be initiated by builder() itself, so
         * you dont normaly have to call this except if you want to
         * extend its behaviour
         */
        proxyFactory(proxyFactory: ProxyFactory): IFeignBuilder;
        /**
         * adds a request interceptor that will be called just before handing the
         * request to the registered FeignClient
         */
        requestInterceptor(requestInterceptor: Interceptor): IFeignBuilder;
        /**
         * sets the baseUrl and apiDescription with which the
         * client should be generated
         *
         * @return the generated client-object
         */
        target(apiDescription: any, baseUrl: string): any;
    }
    /**
     * creates a feign-builder to build up a rest-client.
     * parameters can be given named as object or unnamed
     *
     * @param {boolean} promise promise or callback api-style
     */
    function builder(): IFeignBuilder;
}
declare module feign {
    interface FeignClient {
        request(description: RequestDescription): Promise<Response>;
    }
    interface RequestDescription {
        baseUrl: string;
        options: Options;
        parameters: any[];
    }
    interface Response {
        raw: any;
        body: any;
    }
    interface Options {
        method: string;
        uri: any;
    }
    interface Interceptor {
        apply(description: RequestDescription): void;
    }
    class Wrapper {
        private options;
        private client;
        private interceptors;
        constructor(options: Options, client: any, interceptors: Interceptor[]);
        private getProcessedUrl(request, pathParameters);
        executeRequest(baseUrl: string, callArguments: any[]): Promise<any>;
        private processInterceptors(request);
    }
}
