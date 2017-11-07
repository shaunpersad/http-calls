"use strict";
const HttpService = require('../lib/HttpService');
const HttpServiceCall = require('../lib/HttpServiceCall');
const arraysAreEqual = require('./arraysAreEqual');

describe('HttpService', function() {

    describe('service = new HttpService(name, baseUrl)', function() {

        describe('service.clone()', function() {

            it('should create a new instance that inherits all properties from the instance that created it', function() {

                const service = new HttpService('test-service', 'http://localhost');
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

                const service = new HttpService('test-service', 'http://localhost');

                const options = {
                    namespace: 'api.',
                    prefix: '/api',
                    events: {
                        onRequestStart: () => {},
                        onRequestEnd: () => {},
                        onRequestError: () => {},
                        onResponseError: () => {},
                        onError: () => {},
                        onCallDefinition: () => {}
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
                            onRequestError: () => {},
                            onResponseError: () => {},
                            onError: () => {},
                            onCallDefinition: () => {}
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

                const service = new HttpService('test-service', 'http://localhost');
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

                const serviceMod = new HttpServiceMod('test-service', 'http://localhost');
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

                const service = new HttpService('test-service', 'http://localhost/api/');
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

                const service = new HttpService('test-service', 'http://localhost');

                const options = {
                    namespace: 'api.',
                    prefix: '/api',
                    events: {
                        onRequestStart: () => {},
                        onRequestEnd: () => {},
                        onRequestError: () => {},
                        onResponseError: () => {},
                        onError: () => {},
                        onCallDefinition: () => {}
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
                            onRequestError: () => {},
                            onResponseError: () => {},
                            onError: () => {},
                            onCallDefinition: () => {}
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
                        if (!arraysAreEqual(Object.keys(serviceCall.headersParams), ['foo', 'baz', 'fred', 'thud'])) {
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
        });

        describe('serviceCall = service.createServiceCall(name, uri)', function() {

            it('should create a new instance of HttpServiceCall, with the proper name and uri set, and a default method of GET', function() {

                const service = new HttpService('test-service', 'http://localhost/api/');
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

                const service = new HttpService('test-service', 'http://localhost/api/');
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

    describe('service = new HttpService(name, baseUrl, events)', function() {

        it('should create a new service with the proper event handlers', function() {

            let numClicks = 0;
            const incClicks = () => numClicks++;
            const events = {
                onRequestStart: incClicks,
                onRequestEnd: incClicks,
                onRequestError: incClicks,
                onResponseError: incClicks,
                onError: incClicks,
                onCallDefinition: incClicks
            };
            const service = new HttpService('test-service', 'http://localhost', events);

            service.events.onRequestStart();
            service.events.onRequestEnd();
            service.events.onRequestError();
            service.events.onResponseError();
            service.events.onError();
            service.events.onCallDefinition();

            service.group({ namespace: 'hi' }, (service) => {

                service.events.onRequestStart();
                service.events.onRequestEnd();
                service.events.onRequestError();
                service.events.onResponseError();
                service.events.onError();
                service.events.onCallDefinition();

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
            const service = new HttpServiceMod('test', 'http://localhost');
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
            const service = new HttpService('test-service', 'http://localhost');
            const serviceCall = service.createServiceCall('test-service-call');

            HttpService.setServiceCall(serviceCalls, serviceCall.serviceCallName, serviceCall);

            if (serviceCalls[serviceCall.serviceCallName] !== serviceCall) {
                throw new Error();
            }
        });
    });
});
