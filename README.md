# http-calls
A utility for describing and executing http service calls

## Motivation
This is an abstraction layer on top of http service calls e.g. ajax calls from the browser, or server-to-server http calls in node.

It's purpose is to expressively describe, validate, and hook into the various API calls an application might make.

Features and use cases:
- Easily create new API service calls with less repeated code (like copy/pasting the same `request` module calls everywhere)
- Event hooks, which can be used for centralized logging for every service call made
- Automatic validation of both input params as well as responses
- Easily swap out the underlying network library, e.g. swapping out `fetch` for `axios`

## Installation
```bash
npm install http-calls --save
```

## Quickstart
```js
const request = require('request');
const { HttpService } = require('http-calls');

/**
* Extend the base HttpService class to implement your own network library layer.
*/
class RequestService extends HttpService {
    
    static makeRequest(input, serviceCall, callback) {
        
        request({
            url: input.url,
            method: input.method,
            headers: input.headers,
            qs: input.query,
            body: input.body,
            json: true
        }, (err, res, payload) => {
            
            callback(err, payload, res.statusCode, res.headers);
        });
    }
}

const github = new RequestService('github', 'https://api.github.com');

github.group({ prefix: '/search', queryParams: { q: { type: 'string' } } }, (github) => {
   
    github.createServiceCall('searchUsers', '/users', 'get');
    
    github.createServiceCall('searchRepos', '/repositories', 'get');
});

github.serviceCalls.searchUsers.execute({ query: { q: 'shaunpersad' } }, (err, payload) => {
    // handle response payload
});
github.serviceCalls.searchRepos.execute({ query: { q: 'http-calls' } }, (err, payload) => {
    // handle response payload
});
```
The above code creates two service calls via `service.createServiceCall`:
- `GET https://api.github.com/search/users?q={string}`
- `GET https://api.github.com/search/repositories?q={string}`

We then call `service.serviceCalls[serviceCallName].execute` to send the following requests:
- `GET https://api.github.com/search/users?q=shaunpersad`
- `GET https://api.github.com/search/repositories?q=http-calls`

