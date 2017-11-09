"use strict";
const HttpService = require('../lib/HttpService');
const HttpServiceCall = require('../lib/HttpServiceCall');
const RequestError = require('../lib/RequestError');
const ResponseError = require('../lib/ResponseError');
const arraysAreEqual = require('./arraysAreEqual');

describe('HttpService', function() {

    describe('service = new HttpService(baseUrl)', function() {

        describe('service.clone()', function() {

            it('should create a new instance that inherits all properties from the instance that created it', function() {

                const service = new HttpService('http://localhost');
                const properties = [
                    'headersInputs',
                    'queryInputs',
                    'pathInputs',
                    'bodyInputs',
                    'headersInputSchemaParams',
                    'queryInputSchemaParams',
                    'pathInputSchemaParams',
                    'bodyInputSchemaParams',
                    'headersInputSchemaRequired',
                    'queryInputSchemaRequired',
                    'pathInputSchemaRequired',
                    'bodyInputSchemaRequired',
                    'serviceCallNamespaces',
                    'serviceCallPrefixes',
                    'serviceCallEvents'
                ];
                properties.forEach(property => {

                    service[property].push(Math.random());
                });

                const clone = service.clone();

                if (clone === service) {
                    throw new Error();
                }
                properties.forEach(property => {

                    if (!arraysAreEqual(service[property], clone[property])) {
                        throw new Error();
                    }
                });

                if (clone.serviceCalls !== service.serviceCalls) {
                    throw new Error();
                }
            });

        });

        describe('service.group(options, closure)', function() {

            it('should create a new instance by applying the options provided to the existing service, and return it in the closure', function() {

                const service = new HttpService('http://localhost');

                const options = {
                    namespace: 'api.',
                    prefix: '/api',
                    events: {
                        onRequestStart: () => {},
                        onRequestEnd: () => {},
                        onInvalidRequest: () => {},
                        onInvalidResponse: () => {},
                        onError: () => {},
                        onCallRegistration: () => {}
                    },
                    headers: {
                        foo: 'bar',
                        baz: 'qux'
                    },
                    query: {
                        baz: 'qux',
                        quux: 'corge'
                    },
                    path: {
                        quux: 'corge',
                        uier: 'grault'
                    },
                    body: {
                        uier: 'grault',
                        garply: 'waldo'
                    },
                    headersParams: {
                        foo: { type: 'string' },
                        baz:  { type: 'string' }
                    },
                    optionalHeadersParams: ['baz'],
                    queryParams: {
                        baz: { type: 'string' },
                        quux: { type: 'string' }
                    },
                    optionalQueryParams: ['baz'],
                    pathParams: {
                        quux: { type: 'string' },
                        uier: { type: 'string' }
                    },
                    optionalPathParams: ['uier'],
                    bodyParams: {
                        uier: { type: 'string' },
                        garply: { type: 'string' }
                    },
                    optionalBodyParams: ['garply'],
                };

                service.group(options, (clone) => {

                    if (service === clone) {
                        throw new Error();
                    }


                    [
                        'headersInputs',
                        'queryInputs',
                        'pathInputs',
                        'bodyInputs',
                        'headersInputSchemaParams',
                        'queryInputSchemaParams',
                        'pathInputSchemaParams',
                        'bodyInputSchemaParams',
                        'headersInputSchemaRequired',
                        'queryInputSchemaRequired',
                        'pathInputSchemaRequired',
                        'bodyInputSchemaRequired',
                        'serviceCallNamespaces',
                        'serviceCallPrefixes',
                        'serviceCallEvents'
                    ].forEach(property => {

                        if (arraysAreEqual(service[property], clone[property])) {
                            throw new Error(property);
                        }
                    });

                    if (clone.serviceCalls !== service.serviceCalls) {
                        throw new Error();
                    }

                    const cloneOptions = {
                        namespace: 'v1.',
                        prefix: '/v1',
                        events: {
                            onRequestStart: () => {},
                            onRequestEnd: () => {},
                            onInvalidRequest: () => {},
                            onInvalidResponse: () => {},
                            onError: () => {},
                            onCallRegistration: () => {}
                        },
                        headers: {
                            fred: 'plugh',
                            thud: 'mos'
                        },
                        headersParams: {
                            fred: { type: 'string' },
                            thud:  { type: 'string' }
                        },
                        optionalHeadersParams: ['thud']
                    };

                    clone.group(cloneOptions, (secondClone) => {


                        [
                            'headersInputs',
                            'headersInputSchemaParams',
                            'headersInputSchemaRequired',
                            'serviceCallNamespaces',
                            'serviceCallPrefixes',
                            'serviceCallEvents'
                        ].forEach(property => {

                            if (arraysAreEqual(clone[property], secondClone[property])) {
                                throw new Error(property);
                            }
                        });


                        if (secondClone.serviceCalls !== service.serviceCalls) {
                            throw new Error();
                        }

                        if (!arraysAreEqual(Object.keys(secondClone.headersInputs[0]), ['foo', 'baz'])) {
                            throw new Error();
                        }

                        if (!arraysAreEqual(Object.keys(secondClone.headersInputs[1]), ['fred', 'thud'])) {
                            throw new Error();
                        }

                        if (!arraysAreEqual(Object.keys(secondClone.headersInputSchemaParams[0]), ['foo', 'baz'])) {
                            throw new Error();
                        }

                        if (!arraysAreEqual(Object.keys(secondClone.headersInputSchemaParams[1]), ['fred', 'thud'])) {
                            throw new Error();
                        }

                        if (secondClone.headersInputSchemaRequired[0] !== 'foo') {
                            throw new Error();
                        }

                        if (secondClone.headersInputSchemaRequired[1] !== 'fred') {
                            throw new Error();
                        }

                    });
                });
            });
        });

        describe('service.serviceCalls', function() {

            it('should house any registered service calls, based on the installed HttpService.setServiceCall function', function() {

                const service = new HttpService('http://localhost');
                service.group({
                    namespace: 'api.'
                }, (service) => {

                    service.createServiceCall('users', '/users').register();
                    const serviceCall = service.serviceCalls['api.users'];
                    if (!(serviceCall instanceof HttpServiceCall)) {
                        throw new Error();
                    }
                    if (serviceCall.serviceCallName !== 'api.users') {
                        throw new Error();
                    }
                    if (serviceCall.endpointUrl !== 'http://localhost/users') {
                        throw new Error();
                    }
                });

                const serviceCall = service.serviceCalls['api.users'];
                if (!(serviceCall instanceof HttpServiceCall)) {
                    throw new Error();
                }
                if (serviceCall.serviceCallName !== 'api.users') {
                    throw new Error();
                }
                if (serviceCall.endpointUrl !== 'http://localhost/users') {
                    throw new Error();
                }

                const HttpServiceMod = class extends HttpService {
                    static setServiceCall(serviceCalls, serviceCallName, serviceCall) {
                        serviceCalls.api = {
                            users: serviceCall
                        }
                    }
                };

                const serviceMod = new HttpServiceMod('http://localhost');
                serviceMod.group({
                    namespace: 'api.'
                }, (service) => {

                    service.createServiceCall('users', '/users').register();
                });

                const serviceModCall = serviceMod.serviceCalls.api.users;

                if (!(serviceModCall instanceof HttpServiceCall)) {
                    throw new Error();
                }
                if (serviceModCall.serviceCallName !== 'api.users') {
                    throw new Error();
                }
                if (serviceModCall.endpointUrl !== 'http://localhost/users') {
                    throw new Error();
                }
            });
        });

        describe('serviceCall = service.createServiceCall(name)', function() {

            it('should create a new instance of HttpServiceCall, with the proper name set, and a default uri of / and a default method of GET', function() {

                const service = new HttpService('http://localhost/api/');
                const serviceCall1 = service.createServiceCall('service-call-1');

                if (!(serviceCall1 instanceof HttpServiceCall)) {
                    throw new Error();
                }

                if (serviceCall1.serviceCallName !== 'service-call-1') {
                    throw new Error();
                }
                if (serviceCall1.endpointUrl !== 'http://localhost/api') {
                    throw new Error();
                }
                if (serviceCall1.method !== 'get') {
                    throw new Error();
                }

            });

            it('should inherit properties from the service that created it', function() {

                const service = new HttpService('http://localhost');

                const options = {
                    namespace: 'api.',
                    prefix: '/api',
                    events: {
                        onRequestStart: () => {},
                        onRequestEnd: () => {},
                        onInvalidRequest: () => {},
                        onInvalidResponse: () => {},
                        onError: () => {},
                        onCallRegistration: () => {}
                    },
                    headers: {
                        foo: 'bar',
                        baz: 'qux'
                    },
                    query: {
                        baz: 'qux',
                        quux: 'corge'
                    },
                    path: {
                        quux: 'corge',
                        uier: 'grault'
                    },
                    body: {
                        uier: 'grault',
                        garply: 'waldo'
                    },
                    headersParams: {
                        foo: { type: 'string' },
                        baz:  { type: 'string' }
                    },
                    optionalHeadersParams: ['baz'],
                    queryParams: {
                        baz: { type: 'string' },
                        quux: { type: 'string' }
                    },
                    optionalQueryParams: ['baz'],
                    pathParams: {
                        quux: { type: 'string' },
                        uier: { type: 'string' }
                    },
                    optionalPathParams: ['uier'],
                    bodyParams: {
                        uier: { type: 'string' },
                        garply: { type: 'string' }
                    },
                    optionalBodyParams: ['garply'],
                };

                service.group(options, (service) => {

                    let clicked = false;
                    const options = {
                        namespace: 'v1.',
                        prefix: '/v1',
                        events: {
                            onRequestStart: () => {
                                clicked = true;
                            },
                            onRequestEnd: () => {},
                            onInvalidRequest: () => {},
                            onInvalidResponse: () => {},
                            onError: () => {},
                            onCallRegistration: () => {}
                        },
                        headers: {
                            fred: 'plugh',
                            thud: 'mos'
                        },
                        headersParams: {
                            fred: { type: 'string' },
                            thud:  { type: 'string' }
                        },
                        optionalHeadersParams: ['thud']
                    };

                    service.group(options, (service) => {

                        const serviceCall = service.createServiceCall('test-service-call', '/users', 'post');

                        if (serviceCall.serviceCallName !== 'api.v1.test-service-call') {
                            throw new Error();
                        }
                        if (serviceCall.endpointUrl !== 'http://localhost/api/v1/users') {
                            throw new Error();
                        }
                        if (!arraysAreEqual(Object.keys(serviceCall.groupHeadersInputs), ['foo', 'baz', 'fred', 'thud'])) {
                            throw new Error();
                        }
                        if (!arraysAreEqual(Object.keys(serviceCall.inputSchema.properties.headers.properties), ['foo', 'baz', 'fred', 'thud'])) {
                            throw new Error();
                        }
                        if (!arraysAreEqual(serviceCall.inputSchema.properties.headers.required, ['foo', 'fred'])) {
                            throw new Error();
                        }
                        serviceCall.service.events.onRequestStart();
                        if (!clicked) {
                            throw new Error();
                        }

                    });
                });
            });

            describe('serviceCall', function() {

                describe('serviceCall.clone()', function() {

                    it('should create a new instance that inherits all properties from the instance that created it', function() {

                        const service = new HttpService('http://localhost');

                        service.group({
                            headers: {
                                foo: 'bar'
                            }
                        }, (service) => {

                            const serviceCall = service.createServiceCall('test-call', '/users');
                            const clone = serviceCall.clone();

                            if (serviceCall === clone) {
                                throw new Error();
                            }
                            if (serviceCall.service !== clone.service) {
                                throw new Error();
                            }
                            if (serviceCall.serviceCallName !== clone.serviceCallName) {
                                throw new Error();
                            }
                            if (serviceCall.endpointPath !== clone.endpointPath) {
                                throw new Error();
                            }
                            if (serviceCall.endpointUrl !== clone.endpointUrl) {
                                throw new Error();
                            }
                            if (serviceCall.method !== clone.method) {
                                throw new Error();
                            }

                        });
                    });
                });

                describe('serviceCall.events({})', function() {

                    it('should override the service events', function() {

                        let count = 0;

                        const HttpServiceMod = class extends HttpService {
                            static makeRequest(input, serviceCall, callback) {

                                callback();
                            }
                        };
                        const service = new HttpServiceMod('http://localhost', {
                            onRequestStart: () => {
                                throw new Error();
                            },
                            onRequestEnd: () => {
                                throw new Error();
                            },
                        });
                        const serviceCall = service.createServiceCall('testService', '/users').events({
                            onRequestStart: () => {
                                count++;
                            },
                            onRequestEnd: () => {
                                count++;
                            }
                        });
                        serviceCall.execute({}, (err) => {

                            if (count !== 2) {
                                throw new Error();
                            }
                        });
                    });

                });

                describe('serviceCall.register()', function() {

                    it('should register itself in the serviceCalls of the service, and fire the onCallRegistration event', function() {

                        let _serviceCall;

                        const service = new HttpService('http://localhost', {
                            onCallRegistration: (serviceCall) => {

                                _serviceCall = serviceCall;
                            }
                        });
                        const serviceCall = service.createServiceCall('call').register();
                        if (serviceCall !== service.serviceCalls['call']) {
                            throw new Error();
                        }
                        if (_serviceCall !== service.serviceCalls['call']) {
                            throw new Error();
                        }
                    });
                });

                describe('serviceCall.execute(input, callback)', function() {

                    it('should call the HttpService.makeRequest method, along with all relevant events', function() {

                        let _serviceCall;
                        let _input;
                        let count = 0;

                        const Service = class extends HttpService {
                            static makeRequest(input, serviceCall, callback) {

                                if (input !== _input || !arraysAreEqual(Object.keys(input), Object.keys(_input))) {
                                    throw new Error();
                                }
                                if (
                                    input.url !== 'http://localhost/users/one/edit' ||
                                    input.method !== 'put' ||
                                    input.headers.Authorization !== 'Bearer x' ||
                                    input.path.userId !== 'one' ||
                                    input.query.expanded !== true ||
                                    input.body.firstName !== 'Shaun'
                                ) {
                                    throw new Error();
                                }
                                if (_serviceCall !== serviceCall) {
                                    throw new Error();
                                }

                                callback(null, { foo: 'bar' }, 200, { baz: 'qux' });
                            }
                        };

                        const service = new Service('http://localhost', {
                            onCallRegistration: function(serviceCall) {
                                _serviceCall = serviceCall;
                                count++;
                            },
                            onRequestStart: function(input) {
                                _input = input;
                                if (this !== _serviceCall) {
                                    throw new Error();
                                }
                                count++;
                            },
                            onRequestEnd: function(err, payload, status, headers) {
                                if (this !== _serviceCall) {
                                    throw new Error();
                                }
                                count++;
                            }
                        });

                        service
                            .createServiceCall('testService', '/users/{userId}/edit', 'put')
                            .headersSchema({
                                Authorization: {
                                    type: 'string'
                                }
                            }, ['Authorization'])
                            .pathSchema({
                                userId: {
                                    type: 'string'
                                }
                            })
                            .querySchema({
                                expanded: {
                                    type: 'boolean'
                                }
                            })
                            .bodySchema({
                                firstName: {
                                    type: 'string'
                                }
                            })
                            .success({
                                type: 'object',
                                properties: {
                                    foo: {
                                        type: 'string'
                                    }
                                },
                                required: ['foo']
                            })
                            .register();

                        service.serviceCalls.testService.execute({
                            headers: {
                                Authorization: 'Bearer x'
                            },
                            path: {
                                userId: 'one'
                            },
                            query: {
                                expanded: true
                            },
                            body: {
                                firstName: 'Shaun'
                            }
                        }, (err, response, status, headers, serviceCall) => {

                            if (err) {
                                throw new Error();
                            }
                            if (response.foo !== 'bar') {
                                throw new Error();
                            }
                            if (status !== 200) {
                                throw new Error();
                            }
                            if (!arraysAreEqual(Object.keys(headers), ['baz'])) {
                                throw new Error();
                            }
                            if (serviceCall !== _serviceCall) {
                                throw new Error();
                            }
                            if (count !== 3) {
                                throw new Error();
                            }
                        });
                    });

                    it('should allow successful calls without registering a response', function() {

                        let _serviceCall;
                        let _input;
                        let count = 0;

                        const Service = class extends HttpService {
                            static makeRequest(input, serviceCall, callback) {

                                if (input !== _input || !arraysAreEqual(Object.keys(input), Object.keys(_input))) {
                                    throw new Error();
                                }
                                if (
                                    input.url !== 'http://localhost/users/one/edit' ||
                                    input.method !== 'put' ||
                                    input.headers.Authorization !== 'Bearer x' ||
                                    input.path.userId !== 'one' ||
                                    input.query.expanded !== true ||
                                    input.body.firstName !== 'Shaun'
                                ) {
                                    throw new Error();
                                }
                                if (_serviceCall !== serviceCall) {
                                    throw new Error();
                                }

                                callback(null, { foo: 'bar' }, 200, { baz: 'qux' });
                            }
                        };

                        const service = new Service('http://localhost', {
                            onCallRegistration: function(serviceCall) {
                                _serviceCall = serviceCall;
                                count++;
                            },
                            onRequestStart: function(input) {
                                _input = input;
                                if (this !== _serviceCall) {
                                    throw new Error();
                                }
                                count++;
                            },
                            onRequestEnd: function(err, payload, status, headers) {

                                if (err) {
                                    throw new Error();
                                }
                                if (payload.foo !== 'bar') {
                                    throw new Error();
                                }
                                if (status !== 200) {
                                    throw new Error();
                                }
                                if (!arraysAreEqual(Object.keys(headers), ['baz'])) {
                                    throw new Error();
                                }

                                if (this !== _serviceCall) {
                                    throw new Error();
                                }
                                count++;
                            }
                        });

                        service
                            .createServiceCall('testService', '/users/{userId}/edit', 'put')
                            .headersSchema({
                                Authorization: {
                                    type: 'string'
                                }
                            }, ['Authorization'])
                            .pathSchema({
                                userId: {
                                    type: 'string'
                                }
                            })
                            .querySchema({
                                expanded: {
                                    type: 'boolean'
                                }
                            })
                            .bodySchema({
                                firstName: {
                                    type: 'string'
                                }
                            })
                            .register();

                        service.serviceCalls.testService.execute({
                            headers: {
                                Authorization: 'Bearer x'
                            },
                            path: {
                                userId: 'one'
                            },
                            query: {
                                expanded: true
                            },
                            body: {
                                firstName: 'Shaun'
                            }
                        }, (err, payload, status, headers, serviceCall) => {

                            if (err) {
                                throw new Error();
                            }
                            if (payload.foo !== 'bar') {
                                throw new Error();
                            }
                            if (status !== 200) {
                                throw new Error();
                            }
                            if (!arraysAreEqual(Object.keys(headers), ['baz'])) {
                                throw new Error();
                            }
                            if (serviceCall !== _serviceCall) {
                                throw new Error();
                            }
                        });
                    });

                    it('should allow successful calls without registering anything', function() {

                        let _serviceCall;
                        let _input;
                        let count = 0;

                        const Service = class extends HttpService {
                            static makeRequest(input, serviceCall, callback) {

                                if (input !== _input || !arraysAreEqual(Object.keys(input), Object.keys(_input))) {
                                    throw new Error();
                                }
                                if (
                                    input.url !== 'http://localhost/users/one/edit' ||
                                    input.method !== 'put' ||
                                    input.headers.Authorization !== 'Bearer x' ||
                                    input.path.userId !== 'one' ||
                                    input.query.expanded !== true ||
                                    input.body.firstName !== 'Shaun'
                                ) {
                                    throw new Error();
                                }
                                if (_serviceCall !== serviceCall) {
                                    throw new Error();
                                }

                                callback(null, { foo: 'bar' }, 200, { baz: 'qux' });
                            }
                        };

                        const service = new Service('http://localhost', {
                            onCallRegistration: function(serviceCall) {
                                _serviceCall = serviceCall;
                                count++;
                            },
                            onRequestStart: function(input) {
                                _input = input;
                                if (this !== _serviceCall) {
                                    throw new Error();
                                }
                                count++;
                            },
                            onRequestEnd: function(err, payload, status, headers) {
                                if (this !== _serviceCall) {
                                    throw new Error();
                                }
                                if (err) {
                                    throw new Error();
                                }
                                if (payload.foo !== 'bar') {
                                    throw new Error();
                                }
                                if (status !== 200) {
                                    throw new Error();
                                }
                                if (!arraysAreEqual(Object.keys(headers), ['baz'])) {
                                    throw new Error();
                                }

                                count++;
                            }
                        });

                        service
                            .createServiceCall('testService', '/users/{userId}/edit', 'put')
                            .register();

                        service.serviceCalls.testService.execute({
                            headers: {
                                Authorization: 'Bearer x'
                            },
                            path: {
                                userId: 'one'
                            },
                            query: {
                                expanded: true
                            },
                            body: {
                                firstName: 'Shaun'
                            }
                        }, (err, payload, status, headers, serviceCall) => {

                            if (err) {
                                throw new Error();
                            }
                            if (payload.foo !== 'bar') {
                                throw new Error();
                            }
                            if (status !== 200) {
                                throw new Error();
                            }
                            if (!arraysAreEqual(Object.keys(headers), ['baz'])) {
                                throw new Error();
                            }
                            if (serviceCall !== _serviceCall) {
                                throw new Error();
                            }
                        });

                    });

                    it('should fire onInvalidResponse, onError, and onRequestEnd and pass an instance of ResponseError to the callback if a successful call does not match the expected format', function() {

                        let _serviceCall;
                        let _input;
                        let count = 0;

                        const Service = class extends HttpService {
                            static makeRequest(input, serviceCall, callback) {

                                callback(null, { message: 'error' }, 200, { baz: 'qux' });
                            }
                        };

                        const service = new Service('http://localhost', {
                            onCallRegistration: function(serviceCall) {
                                _serviceCall = serviceCall;
                                count++;
                            },
                            onRequestStart: function(input) {
                                _input = input;
                                if (this !== _serviceCall) {
                                    throw new Error();
                                }
                                count++;
                            },
                            onInvalidResponse: function(responseError) {

                                if (!(responseError instanceof ResponseError)) {
                                    throw new Error();
                                }
                                if (responseError.input !== _input) {
                                    throw new Error();
                                }
                                if (responseError.payload.message !== 'error') {
                                    throw new Error();
                                }
                                if (responseError.status !== 200) {
                                    throw new Error();
                                }
                                if (responseError.headers.baz !== 'qux') {
                                    throw new Error();
                                }
                                if (!responseError.validationErrors) {
                                    throw new Error();
                                }

                                count++;
                            },
                            onError: function(err) {

                                if (!(err instanceof ResponseError)) {
                                    throw new Error();
                                }
                                if (err.input !== _input) {
                                    throw new Error();
                                }
                                if (err.payload.message !== 'error') {
                                    throw new Error();
                                }
                                if (err.status !== 200) {
                                    throw new Error();
                                }
                                if (err.headers.baz !== 'qux') {
                                    throw new Error();
                                }
                                if (!err.validationErrors) {
                                    throw new Error();
                                }

                                count++;
                            },
                            onRequestEnd: function(err, payload, status, headers) {
                                if (this !== _serviceCall) {
                                    throw new Error();
                                }
                                if (!err) {
                                    throw new Error();
                                }
                                if (!(err instanceof ResponseError)) {
                                    throw new Error();
                                }
                                if (payload.message !== 'error') {
                                    throw new Error();
                                }
                                if (status !== 200) {
                                    throw new Error();
                                }
                                if (headers.baz !== 'qux') {
                                    throw new Error();
                                }
                                count++;
                            }
                        });

                        service
                            .createServiceCall('testService', '/users/{userId}/edit', 'put')
                            .success({
                                type: 'object',
                                properties: {
                                    foo: {
                                        type: 'string'
                                    }
                                },
                                required: ['foo']
                            }, 200)
                            .register();

                        service.serviceCalls.testService.execute({
                            headers: {
                                Authorization: 'Bearer x'
                            },
                            path: {
                                userId: 'one'
                            },
                            query: {
                                expanded: true
                            },
                            body: {
                                firstName: 'Shaun'
                            }
                        }, (err, payload, status, headers, serviceCall) => {

                            if (!err) {
                                throw new Error();
                            }
                            if (!(err instanceof ResponseError)) {
                                throw new Error();
                            }
                            if (payload.message !== 'error') {
                                throw new Error();
                            }
                            if (status !== 200) {
                                throw new Error();
                            }
                            if (headers.baz !== 'qux') {
                                throw new Error();
                            }

                            if (count !== 5) {
                                throw new Error();
                            }
                        });

                    });

                    it('should allow unsuccessful calls to pass through without registering a response', function() {

                        let _serviceCall;
                        let _input;
                        let count = 0;

                        const Service = class extends HttpService {
                            static makeRequest(input, serviceCall, callback) {

                                callback(null, { message: 'error' }, 404, { baz: 'qux' });
                            }
                        };

                        const service = new Service('http://localhost', {
                            onCallRegistration: function(serviceCall) {
                                _serviceCall = serviceCall;
                                count++;
                            },
                            onRequestStart: function(input) {
                                _input = input;
                                if (this !== _serviceCall) {
                                    throw new Error();
                                }
                                count++;
                            },
                            onRequestEnd: function(err, payload, status, headers) {
                                if (this !== _serviceCall) {
                                    throw new Error();
                                }
                                if (err) {
                                    throw new Error();
                                }
                                if (payload.message !== 'error') {
                                    throw new Error();
                                }
                                if (status !== 404) {
                                    throw new Error();
                                }
                                if (headers.baz !== 'qux') {
                                    throw new Error();
                                }


                                count++;
                            }
                        });

                        service
                            .createServiceCall('testService', '/users/{userId}/edit', 'put')
                            .register();

                        service.serviceCalls.testService.execute({
                            headers: {
                                Authorization: 'Bearer x'
                            },
                            path: {
                                userId: 'one'
                            },
                            query: {
                                expanded: true
                            },
                            body: {
                                firstName: 'Shaun'
                            }
                        }, (err, payload, status, headers, serviceCall) => {

                            if (err) {
                                throw new Error();
                            }
                            if (payload.message !== 'error') {
                                throw new Error();
                            }
                            if (status !== 404) {
                                throw new Error();
                            }
                            if (headers.baz !== 'qux') {
                                throw new Error();
                            }

                            if (count !== 3) {
                                throw new Error();
                            }
                        });

                    });

                    it('should not pass through a response error to the callback if an unsuccessful call does not match the expected format, but it should still trigger the onInvalidResponse event', function() {

                        let _serviceCall;
                        let _input;
                        let count = 0;

                        const Service = class extends HttpService {
                            static makeRequest(input, serviceCall, callback) {

                                callback(null, { foo: 'error' }, 404, { baz: 'qux' });
                            }
                        };

                        const service = new Service('http://localhost', {
                            onCallRegistration: function(serviceCall) {
                                _serviceCall = serviceCall;
                                count++;
                            },
                            onRequestStart: function(input) {
                                _input = input;
                                if (this !== _serviceCall) {
                                    throw new Error();
                                }
                                count++;
                            },
                            onInvalidResponse: function(responseError) {

                                if (!(responseError instanceof ResponseError)) {
                                    throw new Error();
                                }
                                if (responseError.input !== _input) {
                                    throw new Error();
                                }
                                if (responseError.payload.foo !== 'error') {
                                    throw new Error();
                                }
                                if (responseError.status !== 404) {
                                    throw new Error();
                                }
                                if (responseError.headers.baz !== 'qux') {
                                    throw new Error();
                                }
                                if (!responseError.validationErrors) {
                                    throw new Error();
                                }

                                count++;

                            },
                            onRequestEnd: function(err, payload, status, headers) {
                                if (this !== _serviceCall) {
                                    throw new Error();
                                }
                                if (err) {
                                    throw new Error();
                                }
                                if (payload.foo !== 'error') {
                                    throw new Error();
                                }
                                if (status !== 404) {
                                    throw new Error();
                                }
                                if (headers.baz !== 'qux') {
                                    throw new Error();
                                }

                                count++;
                            }
                        });

                        service
                            .createServiceCall('testService', '/users/{userId}/edit', 'put')
                            .error({
                                type: 'object',
                                properties: {
                                    message: {
                                        type: 'string'
                                    }
                                },
                                required: ['message']
                            }, 404)
                            .register();

                        service.serviceCalls.testService.execute({
                            headers: {
                                Authorization: 'Bearer x'
                            },
                            path: {
                                userId: 'one'
                            },
                            query: {
                                expanded: true
                            },
                            body: {
                                firstName: 'Shaun'
                            }
                        }, (err, payload, status, headers, serviceCall) => {

                            if (err) {
                                throw new Error();
                            }
                            if (payload.foo !== 'error') {
                                throw new Error();
                            }
                            if (status !== 404) {
                                throw new Error();
                            }
                            if (headers.baz !== 'qux') {
                                throw new Error();
                            }

                            if (count !== 4) {
                                throw new Error();
                            }
                        });

                    });

                    it('invalid headers inputs', function() {

                        let _serviceCall;
                        let _input;
                        let count = 0;

                        const Service = class extends HttpService {
                            static makeRequest(input, serviceCall, callback) {

                                callback(null, { message: 'error' }, 200, { baz: 'qux' });
                            }
                        };

                        const service = new Service('http://localhost', {
                            onCallRegistration: function(serviceCall) {
                                _serviceCall = serviceCall;
                                count++;
                            },
                            onRequestStart: function(input) {
                                _input = input;
                                if (this !== _serviceCall) {
                                    throw new Error();
                                }
                                count++;
                            },
                            onInvalidRequest: function(requestError) {

                                if (!(requestError instanceof RequestError)) {
                                    throw new Error();
                                }
                                if (requestError.input !== _input) {
                                    throw new Error();
                                }
                                if (!requestError.validationErrors) {
                                    throw new Error();
                                }

                                count++;
                            },
                            onError: function(err) {

                                if (!(err instanceof RequestError)) {
                                    throw new Error();
                                }
                                if (err.input !== _input) {
                                    throw new Error();
                                }
                                if (!err.validationErrors) {
                                    throw new Error();
                                }

                                count++;
                            },
                            onRequestEnd: function(err, payload, status, headers) {
                                if (this !== _serviceCall) {
                                    throw new Error();
                                }
                                if (!err) {
                                    throw new Error();
                                }
                                if (!(err instanceof RequestError)) {
                                    throw new Error();
                                }
                                count++;
                            }
                        });

                        service
                            .createServiceCall('testService', '/users/{userId}/edit', 'put')
                            .headersSchema({
                                Authorization: {
                                    type: 'string'
                                }
                            })
                            .register();

                        service.serviceCalls.testService.execute({
                            path: {
                                userId: 'one'
                            }
                        }, (err, payload, status, headers, serviceCall) => {

                            if (!err) {
                                throw new Error();
                            }
                            if (!(err instanceof RequestError)) {
                                throw new Error();
                            }
                            if (count !== 5) {
                                throw new Error();
                            }
                        });
                    });

                    it('invalid query inputs', function() {

                        let _serviceCall;
                        let _input;
                        let count = 0;

                        const Service = class extends HttpService {
                            static makeRequest(input, serviceCall, callback) {

                                callback(null, { message: 'error' }, 200, { baz: 'qux' });
                            }
                        };

                        const service = new Service('http://localhost', {
                            onCallRegistration: function(serviceCall) {
                                _serviceCall = serviceCall;
                                count++;
                            },
                            onRequestStart: function(input) {
                                _input = input;
                                if (this !== _serviceCall) {
                                    throw new Error();
                                }
                                count++;
                            },
                            onInvalidRequest: function(requestError) {

                                if (!(requestError instanceof RequestError)) {
                                    throw new Error();
                                }
                                if (requestError.input !== _input) {
                                    throw new Error();
                                }
                                if (!requestError.validationErrors) {
                                    throw new Error();
                                }

                                count++;
                            },
                            onError: function(err) {

                                if (!(err instanceof RequestError)) {
                                    throw new Error();
                                }
                                if (err.input !== _input) {
                                    throw new Error();
                                }
                                if (!err.validationErrors) {
                                    throw new Error();
                                }

                                count++;
                            },
                            onRequestEnd: function(err, payload, status, headers) {
                                if (this !== _serviceCall) {
                                    throw new Error();
                                }
                                if (!err) {
                                    throw new Error();
                                }
                                if (!(err instanceof RequestError)) {
                                    throw new Error();
                                }
                                count++;
                            }
                        });

                        service
                            .createServiceCall('testService', '/users/{userId}/edit', 'put')
                            .querySchema({
                                expanded: {
                                    type: 'boolean'
                                }
                            })
                            .register();

                        service.serviceCalls.testService.execute({
                            path: {
                                userId: 'one'
                            },
                        }, (err, payload, status, headers, serviceCall) => {

                            if (!err) {
                                throw new Error();
                            }
                            if (!(err instanceof RequestError)) {
                                throw new Error();
                            }
                            if (count !== 5) {
                                throw new Error();
                            }
                        });

                    });

                    it('invalid path inputs', function() {

                        let _serviceCall;
                        let _input;
                        let count = 0;

                        const Service = class extends HttpService {
                            static makeRequest(input, serviceCall, callback) {

                                callback(null, { message: 'error' }, 200, { baz: 'qux' });
                            }
                        };

                        const service = new Service('http://localhost', {
                            onCallRegistration: function(serviceCall) {
                                _serviceCall = serviceCall;
                                count++;
                            },
                            onRequestStart: function(input) {
                                _input = input;
                                if (this !== _serviceCall) {
                                    throw new Error();
                                }
                                count++;
                            },
                            onInvalidRequest: function(requestError) {

                                if (!(requestError instanceof RequestError)) {
                                    throw new Error();
                                }
                                if (requestError.input !== _input) {
                                    throw new Error();
                                }
                                if (!requestError.validationErrors) {
                                    throw new Error();
                                }

                                count++;
                            },
                            onError: function(err) {

                                if (!(err instanceof RequestError)) {
                                    throw new Error();
                                }
                                if (err.input !== _input) {
                                    throw new Error();
                                }
                                if (!err.validationErrors) {
                                    throw new Error();
                                }

                                count++;
                            },
                            onRequestEnd: function(err, payload, status, headers) {
                                if (this !== _serviceCall) {
                                    throw new Error();
                                }
                                if (!err) {
                                    throw new Error();
                                }
                                if (!(err instanceof RequestError)) {
                                    throw new Error();
                                }
                                count++;
                            }
                        });

                        service
                            .createServiceCall('testService', '/users/{userId}/edit', 'put')
                            .pathSchema({
                                userId: {
                                    type: 'string'
                                }
                            })
                            .register();

                        service.serviceCalls.testService.execute({}, (err, payload, status, headers, serviceCall) => {

                            if (!err) {
                                throw new Error();
                            }
                            if (!(err instanceof RequestError)) {
                                throw new Error();
                            }
                            if (count !== 5) {
                                throw new Error();
                            }
                        });

                    });

                    it('invalid body inputs', function() {

                        let _serviceCall;
                        let _input;
                        let count = 0;

                        const Service = class extends HttpService {
                            static makeRequest(input, serviceCall, callback) {

                                callback(null, { message: 'error' }, 200, { baz: 'qux' });
                            }
                        };

                        const service = new Service('http://localhost', {
                            onCallRegistration: function(serviceCall) {
                                _serviceCall = serviceCall;
                                count++;
                            },
                            onRequestStart: function(input) {
                                _input = input;
                                if (this !== _serviceCall) {
                                    throw new Error();
                                }
                                count++;
                            },
                            onInvalidRequest: function(requestError) {

                                if (!(requestError instanceof RequestError)) {
                                    throw new Error();
                                }
                                if (requestError.input !== _input) {
                                    throw new Error();
                                }
                                if (!requestError.validationErrors) {
                                    throw new Error();
                                }

                                count++;
                            },
                            onError: function(err) {

                                if (!(err instanceof RequestError)) {
                                    throw new Error();
                                }
                                if (err.input !== _input) {
                                    throw new Error();
                                }
                                if (!err.validationErrors) {
                                    throw new Error();
                                }

                                count++;
                            },
                            onRequestEnd: function(err, payload, status, headers) {
                                if (this !== _serviceCall) {
                                    throw new Error();
                                }
                                if (!err) {
                                    throw new Error();
                                }
                                if (!(err instanceof RequestError)) {
                                    throw new Error();
                                }
                                count++;
                            }
                        });

                        service
                            .createServiceCall('testService', '/users/{userId}/edit', 'put')
                            .bodySchema({
                                baz: {
                                    type: 'string'
                                }
                            })
                            .register();

                        service.serviceCalls.testService.execute({
                            path: {
                                userId: 'one'
                            },
                            body: {
                                baz: true
                            }
                        }, (err, payload, status, headers, serviceCall) => {

                            if (!err) {
                                throw new Error();
                            }
                            if (!(err instanceof RequestError)) {
                                throw new Error();
                            }
                            if (count !== 5) {
                                throw new Error();
                            }
                        });

                    });

                    it('on error call', function() {

                        let _serviceCall;
                        let _input;
                        let count = 0;
                        const _err = new Error();

                        const Service = class extends HttpService {
                            static makeRequest(input, serviceCall, callback) {

                                callback(_err);
                            }
                        };

                        const service = new Service('http://localhost', {
                            onCallRegistration: function(serviceCall) {
                                _serviceCall = serviceCall;
                                count++;
                            },
                            onRequestStart: function(input) {
                                _input = input;
                                if (this !== _serviceCall) {
                                    throw new Error();
                                }
                                count++;
                            },
                            onInvalidResponse: function(responseError) {

                                count++;
                            },
                            onError: function(err) {
                                if (err !== _err) {
                                    throw new Error();
                                }
                                count++;
                            },
                            onRequestEnd: function(err, payload, status, headers) {
                                if (this !== _serviceCall) {
                                    throw new Error();
                                }
                                if (!err) {
                                    throw new Error();
                                }
                                if (err !== _err) {
                                    throw new Error();
                                }
                                count++;
                            }
                        });

                        service
                            .createServiceCall('testService', '/users/{userId}/edit', 'put')
                            .register();

                        service.serviceCalls.testService.execute({
                            headers: {
                                Authorization: 'Bearer x'
                            },
                            path: {
                                userId: 'one'
                            },
                            query: {
                                expanded: true
                            },
                            body: {
                                firstName: 'Shaun'
                            }
                        }, (err, payload, status, headers, serviceCall) => {

                            if (!err) {
                                throw new Error();
                            }
                            if (err !== _err) {
                                throw new Error();
                            }
                            if (count !== 4) {
                                throw new Error();
                            }
                        });

                    });
                });

            });
        });

        describe('serviceCall = service.createServiceCall(name, uri)', function() {

            it('should create a new instance of HttpServiceCall, with the proper name and uri set, and a default method of GET', function() {

                const service = new HttpService('http://localhost/api/');
                const serviceCall1 = service.createServiceCall('service-call-1', '/users');

                if (serviceCall1.serviceCallName !== 'service-call-1') {
                    throw new Error();
                }
                if (serviceCall1.endpointUrl !== 'http://localhost/api/users') {
                    throw new Error();
                }
                if (serviceCall1.method !== 'get') {
                    throw new Error();
                }
            });
        });

        describe('serviceCall = service.createServiceCall(name, uri, method)', function() {

            it('should create a new instance of HttpServiceCall, with the proper name, uri, and method set', function() {

                const service = new HttpService('http://localhost/api/');
                const serviceCall1 = service.createServiceCall('service-call-1', 'users', 'post');

                if (serviceCall1.serviceCallName !== 'service-call-1') {
                    throw new Error();
                }
                if (serviceCall1.endpointUrl !== 'http://localhost/api/users') {
                    throw new Error();
                }
                if (serviceCall1.method !== 'post') {
                    throw new Error();
                }
            });
        });
    });

    describe('service = new HttpService(baseUrl, events)', function() {

        it('should create a new service with the proper event handlers', function() {

            let numClicks = 0;
            const incClicks = () => numClicks++;
            const events = {
                onRequestStart: incClicks,
                onRequestEnd: incClicks,
                onInvalidRequest: incClicks,
                onInvalidResponse: incClicks,
                onError: incClicks,
                onCallRegistration: incClicks
            };
            const service = new HttpService('http://localhost', events);

            service.events.onRequestStart();
            service.events.onRequestEnd();
            service.events.onInvalidRequest();
            service.events.onInvalidResponse();
            service.events.onError();
            service.events.onCallRegistration();

            service.group({ namespace: 'hi' }, (service) => {

                service.events.onRequestStart();
                service.events.onRequestEnd();
                service.events.onInvalidRequest();
                service.events.onInvalidResponse();
                service.events.onError();
                service.events.onCallRegistration();

                if (numClicks !== 12) {
                    throw new Error();
                }
            });
        });
    });


    describe('HttpService.makeRequest(input, serviceCall, callback)', function() {

        it('should throw an error if not implemented', function() {

            const input = {
                url: 'http://localhost',
                method: 'get',
                headers: {},
                query: {},
                params: {},
                body: {}
            };
            const HttpServiceMod = class extends HttpService {};
            const service = new HttpServiceMod('http://localhost');
            const serviceCall = service.createServiceCall('call');
            let error = false;
            try {
                HttpServiceMod.makeRequest(input, serviceCall, err => {});
            } catch (e) {
                error = true;
            }
            if (!error) {
                throw new Error();
            }
        });

    });

    describe('HttpService.setServiceCall(serviceCalls, serviceCallName, serviceCall)', function() {

        it('should assign the serviceCall to the serviceCalls object using the serviceCallName', function() {

            const serviceCalls = {};
            const service = new HttpService('http://localhost');
            const serviceCall = service.createServiceCall('test-service-call');

            HttpService.setServiceCall(serviceCalls, serviceCall.serviceCallName, serviceCall);

            if (serviceCalls[serviceCall.serviceCallName] !== serviceCall) {
                throw new Error();
            }
        });
    });
});
