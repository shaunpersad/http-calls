"use strict";

const defaultParent = {
    headersInputs: [],
    queryInputs: [],
    pathInputs: [],
    bodyInputs: [],
    headersInputSchemaParams: [],
    queryInputSchemaParams: [],
    pathInputSchemaParams: [],
    bodyInputSchemaParams: [],
    headersInputSchemaRequired: [],
    queryInputSchemaRequired: [],
    pathInputSchemaRequired: [],
    bodyInputSchemaRequired: [],
    responses: []
};

class InputOutput {

    /**
     *
     * @param {InputOutput|{}} [parent]
     */
    constructor(parent = defaultParent) {

        this.headersInputs = [].concat(parent.headersInputs);
        this.queryInputs = [].concat(parent.queryInputs);
        this.pathInputs = [].concat(parent.pathInputs);
        this.bodyInputs = [].concat(parent.bodyInputs);

        this.headersInputSchemaParams = [].concat(parent.headersInputSchemaParams);
        this.queryInputSchemaParams = [].concat(parent.queryInputSchemaParams);
        this.pathInputSchemaParams = [].concat(parent.pathInputSchemaParams);
        this.bodyInputSchemaParams = [].concat(parent.bodyInputSchemaParams);

        this.headersInputSchemaRequired = [].concat(parent.headersInputSchemaRequired);
        this.queryInputSchemaRequired = [].concat(parent.queryInputSchemaRequired);
        this.pathInputSchemaRequired = [].concat(parent.pathInputSchemaRequired);
        this.bodyInputSchemaRequired = [].concat(parent.bodyInputSchemaRequired);

        this.responses = [].concat(parent.responses);
    }

    /**
     *
     * @returns {InputOutput}
     */
    clone() {

        return new this.constructor(this);
    }

    /**
     *
     * @param {object} params
     * @param {[]} [optional]
     * @returns {InputOutput}
     */
    headersSchema(params = {}, optional = []) {

        return this.registerInputSchema('headers', params, optional);
    }

    /**
     *
     * @param {object} params
     * @param {[]} [optional]
     * @returns {InputOutput}
     */
    querySchema(params = {}, optional = []) {

        return this.registerInputSchema('query', params, optional);
    }

    /**
     *
     * @param {object} params
     * @param {[]} [optional]
     * @returns {InputOutput}
     */
    pathSchema(params = {}, optional = []) {

        return this.registerInputSchema('path', params, optional);
    }

    /**
     *
     * @param {object} params
     * @param {[]} [optional]
     * @returns {InputOutput}
     */
    bodySchema(params = {}, optional = []) {

        return this.registerInputSchema('body', params, optional);
    }

    /**
     *
     * @param {string} type
     * @param {object} params
     * @param {[]} optional
     * @returns {InputOutput}
     */
    registerInputSchema(type, params = {}, optional = []) {

        const acceptInputs = this.clone();
        const inputSchemaParamsKey = `${type}InputSchemaParams`;
        const inputSchemaRequiredKey = `${type}InputSchemaRequired`;
        const required = Object.keys(params).filter(param => optional.indexOf(param) !== -1);

        acceptInputs[inputSchemaParamsKey] = this[inputSchemaParamsKey].concat(params);
        acceptInputs[inputSchemaRequiredKey] = this[inputSchemaRequiredKey].concat(required);
        
        return acceptInputs;
    }

    /**
     *
     * @param {object} params
     * @returns {InputOutput}
     */
    headers(params = {}) {

        return this.registerInput('headers', params);
    }

    /**
     *
     * @param {object} params
     * @returns {InputOutput}
     */
    query(params = {}) {

        return this.registerInput('query', params);
    }

    /**
     *
     * @param {object} params
     * @returns {InputOutput}
     */
    path(params = {}) {

        return this.registerInput('path', params);
    }

    /**
     *
     * @param {object} params
     * @returns {InputOutput}
     */
    body(params = {}) {

        return this.registerInput('body', params);
    }

    /**
     *
     * @param {string} type
     * @param {object} params
     * @returns {InputOutput}
     */
    registerInput(type, params = {}) {

        const acceptInputs = this.clone();
        const inputsKey = `${type}Inputs`;

        acceptInputs[inputsKey] = this[inputsKey].concat(params);

        return acceptInputs;
    }

    /**
     *
     * @param {object} schema
     * @param {string|number} status
     * @param {string} contentType
     * @returns {InputOutput}
     */
    success(schema, status = 200, contentType = 'application/json') {
        return this.registerResponse(true, schema, status, contentType);
    }

    /**
     *
     * @param {object} schema
     * @param {string|number} status
     * @param {string} contentType
     * @returns {InputOutput}
     */
    error(schema, status = 500, contentType = 'application/json') {
        return this.registerResponse(false, schema, status, contentType);
    }

    /**
     *
     * @param {boolean} isSuccessResponse
     * @param {object} schema
     * @param {string|number} status
     * @param {string} contentType
     * @returns {InputOutput}
     */
    registerResponse(isSuccessResponse, schema, status, contentType) {

        const acceptInputs = this.clone();

        acceptInputs.responses = this.responses.concat({
            [`${status}`]: {
                schema,
                contentType,
                isSuccessResponse
            }
        });

        return acceptInputs;
    }
}

module.exports = InputOutput;