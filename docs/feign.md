# feign

Declarative Rest Client Api.



* * *

### feign.builder(promise) 

creates a feign-builder to build up a rest-client.parameters can be given named as object or unnamed

**Parameters**

**promise**: `boolean`, promise or callback api-style



### feign.client(feignClient) 

sets the client to be used for ajax-requests. A client has a very simlpe API and can be implemented very easily.It accepts a [request](#request)-Object and returns a **promise** that contains the [response](#response).```javascript{  request: function(request){       }}```

**Parameters**

**feignClient**: `object`, a client that translates a feign-request to some thirdparty library



### feign.requestInterceptor(requestInterceptor) 

adds a request interceptor that will be called with the [request](#request), so it can be altered or loggedA request interceptor looks like that:```javascript{  apply: function(request){       }}```

**Parameters**

**requestInterceptor**: `object`, an interceptor



### feign.target(apiDescription, baseUrl) 

crates the client based on the given api-description and baseUrl

**Parameters**

**apiDescription**: `object`, crates the client based on the given api-description and baseUrl

**baseUrl**: `string`, crates the client based on the given api-description and baseUrl




* * *







**Overview:** Internal types:####Request ```javascript
{
  baseUrl: 'http://localhost/',
  options: {method: 'GET', uri: '/bla'},
  parameters: {}
};```####Response ```javascript
{
  raw: {},
  body: ...
};```


