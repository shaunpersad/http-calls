"use strict";
const Ajv = require('ajv');
const { uriWithParams, paramsFromUri } = require('express-laravel-router');

const InputOutput = require('./InputOutput');
const RequestError = require('./RequestError');
const ResponseError = require('./ResponseError');
const join = require('./join');

const ajv = new Ajv({ useDefaults: true });

class HttpServiceCall extends InputOutput {

    /**
     *
     * @param {HttpService} service
     * @param {string} serviceCallName
     * @param {string} endpointPath
     * @param {string} method
     * @param {InputOutput} [parent]
     */
    constructor(service, serviceCallName, endpointPath, method, parent = service) {

        super(parent);

        this.service = service;
        this.serviceCallName = serviceCallName;
        this.endpointPath = endpointPath;
        this.endpointUrl = join([service.baseUrl, endpointPath]);
        this.method = `${method}`.toLowerCase();
        this.serviceCallEvents = Object.assign({}, this.service.events);

        this.groupHeadersInputs = Object.assign.apply(null, [{}].concat(this.headersInputs));
        this.groupQueryInputs = Object.assign.apply(null, [{}].concat(this.queryInputs));
        this.groupPathInputs = Object.assign.apply(null, [{}].concat(this.pathInputs));
        this.groupBodyInputs = Object.assign.apply(null, [{}].concat(this.bodyInputs));

        this.groupResponses = Object.assign.apply(null, [{}].concat(this.responses));

        const uriParams = paramsFromUri(this.endpointUrl);
        const uriParamsSchema = {};
        uriParams.required.concat(uriParams.optional).forEach(param => {
            uriParamsSchema[param] = {};
        });

        this.inputSchema = {
            type: 'object',
            properties: {
                headers: {
                    type: 'object',
                    properties: Object.assign.apply(null, [{}].concat(this.headersInputSchemaParams)),
                    required: [].concat(Array.from(new Set(this.headersInputSchemaRequired)))
                },
                query: {
                    type: 'object',
                    properties: Object.assign.apply(null, [{}].concat(this.queryInputSchemaParams)),
                    required: [].concat(Array.from(new Set(this.queryInputSchemaRequired)))
                },
                path: {
                    type: 'object',
                    properties: Object.assign.apply(null, [uriParamsSchema].concat(this.pathInputSchemaParams)),
                    required: Array.from(new Set(uriParams.required.concat(this.pathInputSchemaRequired)))
                },
                body: {
                    type: 'object',
                    properties: Object.assign.apply(null, [{}].concat(this.bodyInputSchemaParams)),
                    required: [].concat(Array.from(new Set(this.bodyInputSchemaRequired)))
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

        return new this.constructor(this.service, this.serviceCallName, this.endpointPath, this.method, this);
    }

    events(events = {}) {

        const serviceCall = this.clone();
        Object.assign(serviceCall.serviceCallEvents, events);

        return serviceCall;
    }

    /**
     *
     * @returns {HttpServiceCall}
     */
    register() {

        const serviceCall = this.clone();
        serviceCall.service.constructor.setServiceCall(serviceCall.service.serviceCalls, serviceCall.serviceCallName, serviceCall);
        serviceCall.service.endpoints[serviceCall.endpointPath] = serviceCall;
        serviceCall.serviceCallEvents.onCallRegistration(serviceCall);
        return serviceCall;
    }

    /**
     *
     * @param {object} input
     * @param {function} callback
     */
    execute(input = {}, callback = () => {}) {

        input = Object.assign({
            method: this.method,
            headers: this.groupHeadersInputs,
            query: this.groupQueryInputs,
            path: this.groupPathInputs,
            body: this.groupBodyInputs
        }, input);

        input.url = this.endpointUrl;


        this.serviceCallEvents.onRequestStart.call(this, input);

        if (!this.inputValidator(input)) {

            const requestError = new RequestError(this.inputValidator.errors, input);
            this.serviceCallEvents.onInvalidRequest.call(this, requestError);
            this.serviceCallEvents.onError.call(this, requestError);
            this.serviceCallEvents.onRequestEnd.call(this, requestError);
            return callback(requestError);
        }

        input.url = uriWithParams(this.endpointUrl, input.path);

        this.service.constructor.makeRequest(input, this, (err, payload, status, headers) => {

            if (!err) {

                const response = this.groupResponses[`${status}`];

                if (response && !response.validator(payload)) {

                    const responseError = new ResponseError(input, payload, status, headers, response.validator.errors);

                    this.serviceCallEvents.onInvalidResponse.call(this, responseError);

                    if (response.isSuccessResponse) {
                        err = responseError;
                    }
                }
            }

            if (err) {
                this.serviceCallEvents.onError.call(this, err);
            }
            this.serviceCallEvents.onRequestEnd.call(this, err, payload, status, headers);

            callback(err, payload, status, headers, this);
        });
    }
}

module.exports = HttpServiceCall;