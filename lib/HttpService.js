"use strict";
const path = require('path');

const HttpServiceCall = require('./HttpServiceCall');
const InputOutput = require('./InputOutput');

const noOp = () => {};

/**
 *
 * @type {{onRequestStart: (function()), onRequestEnd: (function()), onRequestError: (function()), onResponseError: (function()), onError: (function()), onCallDefinition: (function())}}
 */
const defaultEvents = {
    onRequestStart: noOp,
    onRequestEnd: noOp,
    onRequestError: noOp,
    onResponseError: noOp,
    onError: noOp,
    onCallDefinition: noOp
};

/**
 *
 * @type {{namespace: string, prefix: string, events: {onRequestStart: (function()), onRequestEnd: (function()), onRequestError: (function()), onResponseError: (function()), onError: (function()), onCallDefinition: (function())}, headers: {}, query: {}, path: {}, body: {}, headersParams: {}, optionalHeadersParams: Array, queryParams: {}, optionalQueryParams: Array, pathParams: {}, optionalPathParams: Array, bodyParams: {}, optionalBodyParams: Array}}
 */
const defaultGroupOptions = {
    namespace: '',
    prefix: '/',
    events: defaultEvents,
    headers: {},
    query: {},
    path: {},
    body: {},
    headersParams: {},
    optionalHeadersParams: [],
    queryParams: {},
    optionalQueryParams: [],
    pathParams: {},
    optionalPathParams: [],
    bodyParams: {},
    optionalBodyParams: [],
};

class HttpService extends InputOutput {

    /**
     *
     * @param {string} name
     * @param {string} baseUrl
     * @param {{}} [events]
     * @param {InputOutput} [parent]
     */
    constructor(name, baseUrl, events = defaultEvents, parent = undefined) {

        super(parent);

        this.serviceName = name;
        this.baseUrl = baseUrl;
        this.events = Object.assign({}, defaultEvents, events);
        this.serviceCallNamespaces = [];
        this.serviceCallPrefixes = [];
        this.serviceCallEvents = [];
        this.serviceCalls = {};
    }

    /**
     *
     * @returns {HttpService}
     */
    clone() {

        return new this.constructor(this.serviceName, this.baseUrl, this.events, this);
    }

    /**
     *
     * @param {{}} options
     * @param {function} closure
     * @returns {HttpService}
     */
    group(options = defaultGroupOptions, closure = (service) => {}) {

        const { 
            namespace, 
            prefix, 
            events, 
            headers,
            query,
            path,
            body,
            headersParams,
            optionalHeadersParams,
            queryParams,
            optionalQueryParams,
            pathParams,
            optionalPathParams,
            bodyParams,
            optionalBodyParams,
        } = Object.assign({}, defaultGroupOptions, options);
        
        const service = this.clone();

        service.serviceCallNamespaces.push(namespace);
        service.serviceCallPrefixes.push(prefix);
        service.serviceCallEvents.push(events);
        
        service.headers(headers);
        service.headersSchema(headersParams, optionalHeadersParams);
        service.query(query);
        service.querySchema(queryParams, optionalQueryParams);
        service.path(path);
        service.pathSchema(pathParams, optionalPathParams);
        service.body(body);
        service.bodySchema(bodyParams, optionalBodyParams);
        
        closure(service);
        return service;
    }

    /**
     *
     * @param {string} name
     * @param {string} uri
     * @param {string} method
     */
    createServiceCall(name, uri = '/', method = 'get') {

        const serviceCallName = this.serviceCallNamespaces.concat(name).join('');
        const endpointUrl = path.join.apply(null, [this.baseUrl].concat(this.serviceCallPrefixes).concat(uri));

        return new HttpServiceCall(this, serviceCallName, endpointUrl, method);
    }
}

/**
 *
 * @param {{}} input
 * @param {HttpServiceCall} serviceCall
 * @param {function} callback
 */
HttpService.makeRequest = function makeRequest(input, serviceCall, callback) {

    throw new Error('Please override the HttpService.makeRequest method');
};

/**
 *
 * @param {{}} registry
 * @param {string} serviceCallName
 * @param {HttpServiceCall} serviceCall
 */
HttpService.setServiceCall = function setServiceCall(registry, serviceCallName, serviceCall) {

    registry[serviceCallName] = serviceCall;
};

module.exports = HttpService;