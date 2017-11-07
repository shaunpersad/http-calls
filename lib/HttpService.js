"use strict";
const HttpServiceCall = require('./HttpServiceCall');
const InputOutput = require('./InputOutput');

const defaultParent = Object.assign({
    serviceCallNamespaces: [],
    serviceCallPrefixes: [],
    serviceCallEvents: [],
    serviceCalls: {},
    serviceCallNames: []
}, InputOutput.defaultParent);

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

function join(pieces) {

    return pieces.map(piece => piece.replace(/^\/|\/$/g, '')).filter(piece => piece.length).join('/');
}


class HttpService extends InputOutput {

    /**
     *
     * @param {string} name
     * @param {string} baseUrl
     * @param {object} [events]
     * @param {HttpService} [parent]
     */
    constructor(name, baseUrl, events = defaultEvents, parent = defaultParent) {

        super(parent);

        this.serviceName = name;
        this.baseUrl = baseUrl.replace(/^\/|\/$/g, '');
        this.events = Object.assign({}, defaultEvents, events);
        this.serviceCallNamespaces = [].concat(parent.serviceCallNamespaces);
        this.serviceCallPrefixes = [].concat(parent.serviceCallPrefixes);
        this.serviceCallEvents = [].concat(parent.serviceCallEvents);
        this.serviceCalls = parent.serviceCalls;
        this.serviceCallNames = parent.serviceCallNames;
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
     * @param {object} options
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

        closure(
            service
                .headers(headers)
                .headersSchema(headersParams, optionalHeadersParams)
                .query(query)
                .querySchema(queryParams, optionalQueryParams)
                .path(path)
                .pathSchema(pathParams, optionalPathParams)
                .body(body)
                .bodySchema(bodyParams, optionalBodyParams)
        );
        return this;
    }

    /**
     *
     * @param {string} name
     * @param {string} uri
     * @param {string} method
     */
    createServiceCall(name, uri = '/', method = 'get') {

        const service = this.clone();
        const serviceCallName = service.serviceCallNamespaces.concat(name).join('');
        const endpointUrl = join([service.baseUrl].concat(service.serviceCallPrefixes.concat(uri)));
        service.events = Object.assign.apply(null, [{}, service.events].concat(service.serviceCallEvents));
        service.serviceCallNames.push(serviceCallName);
        return new HttpServiceCall(service, serviceCallName, endpointUrl, method);
    }

    /**
     *
     * @param {object} input
     * @param {HttpServiceCall} serviceCall
     * @param {function} callback
     */
    static makeRequest(input, serviceCall, callback) {

        throw new Error('Please override the HttpService.makeRequest method');
    }

    /**
     *
     * @param {object} serviceCalls
     * @param {string} serviceCallName
     * @param {HttpServiceCall} serviceCall
     */
    static setServiceCall(serviceCalls, serviceCallName, serviceCall) {

        serviceCalls[serviceCallName] = serviceCall;
    }

    /**
     *
     * @param {{}} serviceCalls
     * @param {string} serviceCallName
     * @returns {HttpServiceCall}
     */
    static getServiceCall(serviceCalls, serviceCallName) {

        return serviceCalls[serviceCallName];
    }
}

module.exports = HttpService;