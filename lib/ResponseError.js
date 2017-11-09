"use strict";

class ResponseError extends Error {

    constructor(input, payload, status, headers, validationErrors, message = 'Unexpected response format') {

        super(message);

        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
        this.input = input;
        this.payload = payload;
        this.status = status;
        this.headers = headers;
        this.validationErrors = validationErrors;
    }

    static get TYPE_VALIDATION() {
        return 'validation';
    }

    static get TYPE_TRANSPORT() {
        return 'transport';
    }
}

module.exports = ResponseError;

