"use strict";
const InputOutput = require('../lib/InputOutput');

function arraysAreEqual(arr1, arr2, join = ',') {

    return [].concat(arr1).sort().join(join) === [].concat(arr2).sort().join(join);
}

describe('InputOutput', function() {

    describe('inputOutput = new InputOutput()', function() {

        it('should create a new instance of InputOutput', function() {

            const inputOutput = new InputOutput();

            if (!(inputOutput instanceof InputOutput)) {
                throw new Error();
            }
        });

        describe('inputOutput', function() {

            describe('inputOutput.clone()', function(){

                it('should create a new instance that inherits all properties from the instance that created it', function() {

                    const inputOutput = new InputOutput();
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
                        'bodyInputSchemaRequired'
                    ];
                    properties.forEach(property => {

                        inputOutput[property].push(Math.random());
                    });

                    const clone = inputOutput.clone();
                    if (clone === inputOutput) {
                        throw new Error();
                    }
                    properties.forEach(property => {

                        if (!arraysAreEqual(inputOutput[property], clone[property])) {
                            throw new Error();
                        }
                    });
                });
            });

            ['headers', 'query', 'path', 'body'].forEach(type => {

                describe(`inputOutput.${type}Schema(params)`, function() {

                    it(`should create a new instance with the proper ${type} schema properties set`, function() {

                        const inputOutput = new InputOutput();
                        const properties = {
                            email: {
                                type: 'string',
                                format: 'email'
                            },
                            password: {
                                type: 'string',
                                minLength: 6
                            }
                        };

                        const clone = inputOutput[`${type}Schema`](properties);

                        if (clone === inputOutput) {
                            throw new Error();
                        }
                        if (!arraysAreEqual(Object.keys(clone[`${type}InputSchemaParams`][0]), ['email', 'password'])) {
                            throw new Error();
                        }
                        if (!arraysAreEqual(clone[`${type}InputSchemaRequired`], ['email', 'password'])) {
                            throw new Error();
                        }
                        if (arraysAreEqual(Object.keys(inputOutput[`${type}InputSchemaParams`][0] || {}), ['email', 'password'])) {
                            throw new Error();
                        }
                        if (arraysAreEqual(inputOutput[`${type}InputSchemaRequired`], ['email', 'password'])) {
                            throw new Error();
                        }

                    });
                });

                describe(`inputOutput.${type}Schema(params, optional)`, function() {

                    it(`should create a new instance with the proper ${type} schema properties set`, function() {

                        const inputOutput = new InputOutput();
                        const properties = {
                            firstName: {
                                type: 'string'
                            },
                            lastName: {
                                type: 'string'
                            }
                        };
                        const optional = ['lastName'];

                        const clone = inputOutput[`${type}Schema`](properties, optional);

                        if (!arraysAreEqual(Object.keys(clone[`${type}InputSchemaParams`][0] || {}), ['firstName', 'lastName'])) {
                            throw new Error();
                        }
                        if (!arraysAreEqual(clone[`${type}InputSchemaRequired`], ['firstName'])) {
                            throw new Error();
                        }
                    });
                });

                describe(`inputOutput.${type}(params)`, function() {

                    it(`should create a new instance with the proper ${type} params set`, function() {

                        const inputOutput = new InputOutput();
                        const params = {
                            email: 'shaunpersad@gmail.com',
                            password: 'slkdjfoisj'
                        };

                        const clone = inputOutput[type](params);

                        if (clone === inputOutput) {
                            throw new Error();
                        }
                        if (!arraysAreEqual(Object.keys(clone[`${type}Inputs`][0] || {}), ['email', 'password'])) {
                            throw new Error();
                        }
                        if (arraysAreEqual(Object.keys(inputOutput[`${type}Inputs`][0] || {}), ['email', 'password'])) {
                            throw new Error();
                        }
                    });
                });
            });

            describe('inputOutput.success(schema)', function() {

                it('should create a new instance with the proper response set, with a default status of 200 and content type of json', function() {

                    const inputOutput = new InputOutput();
                    const schema = {
                        type: 'object',
                        properties: {
                            id: {
                                type: 'string'
                            },
                            email: {
                                type: 'string',
                                format: 'email'
                            }
                        },
                        required: ['id', 'email']
                    };

                    const clone = inputOutput.success(schema);

                    if (clone === inputOutput) {
                        throw new Error();
                    }
                    if (
                        clone.responses[0][200].schema !== schema ||
                        clone.responses[0][200].contentType !== 'application/json' ||
                        clone.responses[0][200].isSuccessResponse !== true
                    ) {
                        throw new Error();
                    }
                    if (inputOutput.responses[0]) {
                        throw new Error();
                    }
                });
            });

            describe('inputOutput.success(schema, status)', function() {

                it('should create a new instance with the proper response set, with a default content type of json', function() {

                    const inputOutput = new InputOutput();
                    const schema = {
                        type: 'object',
                        properties: {
                            id: {
                                type: 'string'
                            },
                            email: {
                                type: 'string',
                                format: 'email'
                            }
                        },
                        required: ['id', 'email']
                    };
                    const status = 203;

                    const clone = inputOutput.success(schema, status);

                    if (clone === inputOutput) {
                        throw new Error();
                    }
                    if (
                        clone.responses[0][status].schema !== schema ||
                        clone.responses[0][status].contentType !== 'application/json' ||
                        clone.responses[0][status].isSuccessResponse !== true
                    ) {
                        throw new Error();
                    }
                    if (inputOutput.responses[0]) {
                        throw new Error();
                    }
                });
            });

            describe('inputOutput.success(schema, status, contentType)', function() {

                it('should create a new instance with the proper response set', function() {

                    const inputOutput = new InputOutput();
                    const schema = {
                        type: 'object',
                        properties: {
                            id: {
                                type: 'string'
                            },
                            email: {
                                type: 'string',
                                format: 'email'
                            }
                        },
                        required: ['id', 'email']
                    };
                    const status = 203;
                    const contentType = 'application/xml';

                    const clone = inputOutput.success(schema, status, contentType);

                    if (clone === inputOutput) {
                        throw new Error();
                    }
                    if (
                        clone.responses[0][status].schema !== schema ||
                        clone.responses[0][status].contentType !== contentType ||
                        clone.responses[0][status].isSuccessResponse !== true
                    ) {
                        throw new Error();
                    }
                    if (inputOutput.responses[0]) {
                        throw new Error();
                    }

                });
            });

            describe('inputOutput.error(schema)', function() {

                it('should create a new instance with the proper response set, with a default status of 500 and content type of json', function() {

                    const inputOutput = new InputOutput();
                    const schema = {
                        type: 'object',
                        properties: {
                            error: {
                                type: 'string'
                            }
                        },
                        required: ['error']
                    };

                    const clone = inputOutput.error(schema);

                    if (clone === inputOutput) {
                        throw new Error();
                    }
                    if (
                        clone.responses[0][500].schema !== schema ||
                        clone.responses[0][500].contentType !== 'application/json' ||
                        clone.responses[0][500].isSuccessResponse !== false
                    ) {
                        throw new Error();
                    }
                    if (inputOutput.responses[0]) {
                        throw new Error();
                    }
                });
            });

            describe('inputOutput.error(schema, status)', function() {

                it('should create a new instance with the proper response set, with a default content type of json', function() {

                    const inputOutput = new InputOutput();
                    const schema = {
                        type: 'object',
                        properties: {
                            error: {
                                type: 'string'
                            }
                        },
                        required: ['error']
                    };
                    const status = 400;

                    const clone = inputOutput.error(schema, status);

                    if (clone === inputOutput) {
                        throw new Error();
                    }
                    if (
                        clone.responses[0][status].schema !== schema ||
                        clone.responses[0][status].contentType !== 'application/json' ||
                        clone.responses[0][status].isSuccessResponse !== false
                    ) {
                        throw new Error();
                    }
                    if (inputOutput.responses[0]) {
                        throw new Error();
                    }
                });
            });

            describe('inputOutput.error(schema, status, contentType)', function() {

                it('should create a new instance with the proper response set', function() {

                    const inputOutput = new InputOutput();
                    const schema = {
                        type: 'object',
                        properties: {
                            error: {
                                type: 'string'
                            }
                        },
                        required: ['error']
                    };
                    const status = 404;
                    const contentType = 'text/html';

                    const clone = inputOutput.error(schema, status, contentType);

                    if (clone === inputOutput) {
                        throw new Error();
                    }
                    if (
                        clone.responses[0][status].schema !== schema ||
                        clone.responses[0][status].contentType !== contentType ||
                        clone.responses[0][status].isSuccessResponse !== false
                    ) {
                        throw new Error();
                    }
                    if (inputOutput.responses[0]) {
                        throw new Error();
                    }

                });
            });

        });
    });

    describe('inputOutput = new InputOutput(parent)', function() {

        it('should create a new instance that inherits all properties from its parent', function() {

            const inputOutput = new InputOutput();
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
                'bodyInputSchemaRequired'
            ];
            properties.forEach(property => {

                inputOutput[property].push(Math.random());
            });

            const clone = new InputOutput(inputOutput);
            if (clone === inputOutput) {
                throw new Error();
            }
            properties.forEach(property => {

                if (!arraysAreEqual(inputOutput[property], clone[property])) {
                    throw new Error();
                }
            });

        });
    });
});