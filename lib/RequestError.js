"use strict";

class RequestError extends Error {

    constructor(validationErrors, input, message = 'Invalid inputs!') {

        super(message);

        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);

        this.validationErrors = validationErrors;
        this.input = input;
    }
}

module.exports = RequestError;
