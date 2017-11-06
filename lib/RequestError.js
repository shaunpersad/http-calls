"use strict";

class RequestError extends Error {

    constructor(errors, message = 'Invalid inputs!') {

        super(message);

        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
        this.errors = errors;
    }
}

module.exports = RequestError;
