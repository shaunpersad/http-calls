"use strict";

class RequestError extends Error {

    constructor(errors, input, message = 'Invalid inputs!') {

        super(message);

        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);

        this.errors = errors;
        this.input = input;
    }
}

module.exports = RequestError;
