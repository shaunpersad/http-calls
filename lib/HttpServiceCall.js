"use strict";
const Ajv = require('ajv');
const { uriWithParams } = require('express-laravel-router');

const InputOutput = require('./InputOutput');
const RequestError = require('./RequestError');

const ajv = new Ajv({ useDefaults: true });
const defaultInput = {
    headers: {},
    query: {},
    path: {},
    body: {}
};


class HttpServiceCall extends InputOutput {

    /**
     *
     * @param {HttpService} service
     * @param {string} serviceCallName
     * @param {string} endpointUrl
     * @param {string} method
     * @param {InputOutput} [parent]
     */
    constructor(service, serviceCallName, endpointUrl, method, parent = service) {

        super(parent);

        this.service = service;
        this.serviceCallName = serviceCallName;
        this.endpointUrl = endpointUrl;
        this.method = `${method}`.toLowerCase();


        this.headersParams = Object.assign.apply(null, [{}].concat(this.headersInputs));
        this.queryParams = Object.assign.apply(null, [{}].concat(this.queryInputs));
        this.pathParams = Object.assign.apply(null, [{}].concat(this.pathInputs));
        this.bodyParams = Object.assign.apply(null, [{}].concat(this.bodyInputs));

        this.inputSchema = {
            type: 'object',
            properties: {
                headers: {
                    type: 'object',
                    properties: Object.assign.apply(null, [{}].concat(this.headersInputSchemaParams)),
                    required: [].concat(this.headersInputSchemaRequired)
                },
                query: {
                    type: 'object',
                    properties: Object.assign.apply(null, [{}].concat(this.queryInputSchemaParams)),
                    required: [].concat(this.queryInputSchemaRequired)
                },
                path: {
                    type: 'object',
                    properties: Object.assign.apply(null, [{}].concat(this.pathInputSchemaParams)),
                    required: [].concat(this.pathInputSchemaRequired)
                },
                body: {
                    type: 'object',
                    properties: Object.assign.apply(null, [{}].concat(this.bodyInputSchemaParams)),
                    required: [].concat(this.bodyInputSchemaRequired)
                },
                method: {
                    type: 'string'
                },
                url: {
                    type: 'string'
                }
            }
        };

        this.inputValidator = ajv.compile(this.inputSchema);
    }

    /**
     *
     * @returns {HttpServiceCall}
     */
    clone() {

        return new this.constructor(this.service, this.serviceCallName, this.endpointUrl, this.method, this);
    }

    /**
     *
     * @returns {HttpServiceCall}
     */
    register() {

        const serviceCall = this.clone();

        serviceCall.service.constructor.setServiceCall(serviceCall.service.serviceCalls, serviceCall.serviceCallName, serviceCall);
        serviceCall.service.events.onCallDefinition(serviceCall);

        return serviceCall;
    }

    /**
     *
     * @param {{}} input
     * @param {function} callback
     */
    execute(input = defaultInput, callback = () => {}) {

        input = Object.assign({
            method: this.method
        }, defaultInput, input);

        Object.assign(input.headers, this.headersParams);
        Object.assign(input.query, this.queryParams);
        Object.assign(input.path, this.pathParams);
        Object.assign(input.body, this.bodyParams);

        input.url = uriWithParams(this.endpointUrl, input.path);

        this.service.events.onRequestStart(input, this);

        if (!this.inputValidator(input)) {

            const requestError = new RequestError(this.inputValidator.errors);
            this.service.events.onError(requestError, this);
            this.service.events.onRequestError(requestError, this);
            return callback(requestError);
        }

        this.service.constructor.makeRequest(input, this, (err, payload, status, headers) => {

            if (err) {
                this.service.events.onError(err, this);
                this.service.events.onResponseError(err, payload, status, headers, this);
            }
            this.service.events.onRequestEnd(err, payload, status, headers, this);
            callback(err, payload, status, headers, this);
        });
    }
}

module.exports = HttpServiceCall;