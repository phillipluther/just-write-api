'use strict';

const assert = require('assert');
const utils = require('../lib/utils');
const colors = require('colors/safe');
const {MockRequest, MockResponse} = require('./helpers/mocks');


describe('lib/utils.js', () => {
    it('return an object of utilities', () => {
        assert(typeof utils === 'object');
    });


    describe('{applyFilters}', () => {
        let {applyFilters} = utils;
        let nameFilter = {name: 'Same'};
        let noMatchFilter = {nothing: 'here'};
        let multipleFilter = {
            name: 'Same',
            num: 1,
        };
        let data = [
            {
                name: 'Same',
                num: 1,
                id: 'd1',
            },
            {
                name: 'Same',
                num: 2,
                id: 'd2',
            },
            {
                name: 'Different',
                num: 3,
                id: 'd3',
            },
        ];

        it('should be a function', () => {
            assert(typeof applyFilters === 'function');
        });

        it('should accept a data array and a filter object', () => {
            applyFilters([], {});
        });

        it('should return an array', () => {
            assert(Array.isArray(applyFilters(data, {})));
        });

        it('should return an empty array if no matches are found', () => {
            let results = applyFilters(data, noMatchFilter);
            assert(results.length === 0);
        });

        it('should return an array of matched results', () => {
            let results = applyFilters(data, nameFilter);
            assert(results.length === 2);
        });

        it('should handle multiple filters as "and"', () => {
            let results = applyFilters(data, multipleFilter);
            assert(results.length === 1);
        });
    });


    describe('{handleErrorResponse}', () => {
        let {handleErrorResponse} = utils;
        let err, req, res;

        beforeEach(() => {
            req = new MockRequest();
            res = new MockResponse();
            err = {
                message: 'Test response',
                status: 400,
            };
        });

        it('should be a function', () => {
            assert(typeof handleErrorResponse === 'function');
        });

        it('should accept a req, res, and err params', () => {
            handleErrorResponse(req, res, err);
        });

        it('should status a response if provided by the error object', () => {
            handleErrorResponse(req, res, err);
            assert(res.status === 400);
        });

        it('should 500 a response if no status is provided by the error', () => {
            delete err.status;
            handleErrorResponse(req, res, err);
            assert(res.status === 500);
        });

        it('should send an error response if provided', () => {
            handleErrorResponse(req, res, err);
            assert(res.send === err.message);
        });

        it('should send a generic status message if not provided by the error', () => {
            delete err.message;
            handleErrorResponse(req, res, err);
            assert(res.send === 'Bad request'); // 400 status
        });
    });


    describe('{handleSuccessResponse}', () => {
        let {handleSuccessResponse} = utils;
        let data, req, res;

        beforeEach(() => {
            data = {
                test: 'OK'
            };
            req = new MockRequest();
            res = new MockResponse();
        });

        it('should be a function', () => {
            assert(typeof handleSuccessResponse === 'function');
        });

        it('should take a req, res, data, and status param', () => {
            handleSuccessResponse(req, res, {}, 201);
        });

        it('should send a default 200 status response', () => {
            handleSuccessResponse(req, res, {});
            assert(res.status === 200);
        });

        it('should send a custom status response if provided', () => {
            handleSuccessResponse(req, res, {}, 999);
            assert(res.status === 999);
        });

        it('should send the given data as JSON', () => {
            handleSuccessResponse(req, res, data);
            assert(res.json === data);
        });
    });


    describe('{hasValue}', () => {
        let {hasValue} = utils;

        it('should be a function', () => {
            assert(typeof hasValue === 'function');
        });

        it('should take a single value param of a primitive type', () => {
            hasValue('a');
            hasValue(true);
            hasValue({});
            hasValue([]);
            hasValue(1);
            hasValue(() => false);
        });

        it('should return TRUE on success', () => {
            assert(hasValue(1) === true);
        });

        it('should return FALSE if a given value is undefined or null', () => {
            let undef;
            let nulled = null;

            assert(hasValue(undef) === false);
            assert(hasValue(nulled) === false);
        });

        it('should return FALSE if a given string is empty', () => {
            assert(hasValue('') === false);
            assert(hasValue('        ') === false);
        });

        it('should return FALSE if a given number is NaN', () => {
            let nan = 10 / 'a';
            assert(hasValue(nan) === false);
        });
    });


    describe('{log}', () => {
        let {log} = utils;

        it('should be a function', () => {
            assert(typeof log === 'function');
        });

        it('should return a namespaced log message as a string', () => {
            let logMessage = log('Hello');

            assert(typeof logMessage === 'string');
            assert(logMessage.indexOf('[just-write-api]') > -1);
            assert(logMessage.indexOf('Hello') > -1);
        });

        it('should apply colors formatting when given a single decorator', () => {
            let logMessage = log('Test', 'blue');
            let needle = colors.blue('Test');

            assert(logMessage.indexOf(needle) > -1);
        });

        it('should apply colors formatting when given an array of decorators', () => {
            let logMessage = log('Test', ['blue', 'bold']);
            let needle = colors.blue.bold('Test');

            assert(logMessage.indexOf(needle) > -1);
        });

        it('should accept error objects for custom handling', () => {
            log(new Error());
        });
    });


    describe('{StatusError}', () => {
        let {StatusError} = utils;
        let instance;

        beforeEach(() => {
            instance = new StatusError();
        });

        it('should be a constructor function', () => {
            assert(typeof StatusError === 'function');
            assert(instance instanceof StatusError);
        });

        it('should contain default status and message properties', () => {
            assert(typeof instance.status === 'number');
            assert(typeof instance.message === 'string');
        });

        it('should take custom status and message properties', () => {
            instance = new StatusError(999, 'Test message');

            assert(instance.status === 999);
            assert(instance.message === 'Test message');
        });

        it('should use a standard message based on status if message is not provided', () => {
            instance = new StatusError(404);
            assert(instance.message === 'Not found');
        });
    });


    describe('{summarizeRequest}', () => {
        let {summarizeRequest} = utils;

        it('should be a function', () => {
            assert(typeof summarizeRequest === 'function');
        });

        it('should return a string', () => {
            assert(typeof summarizeRequest() === 'string');
        });

        it('should return a default summary if no request is provided', () => {
            assert(summarizeRequest() === 'UNKNOWN /');
        });

        it('should turn a given Express req object into a readable summary', () => {
            let summary = summarizeRequest({
                method: 'PUT',
                path: 'test/endpoint',
            });

            assert(summary === 'PUT test/endpoint');
        });

        it('should include query params in a summary', () => {
            let summary = summarizeRequest({
                method: 'GET',
                path: 'test/endpoint',
                query: {
                    name: 'param1',
                    slug: 'param2',
                },
            });

            assert(summary === 'GET test/endpoint?name=param1&slug=param2');
        });
    });

    describe('{validate}', () => {
        let {validate} = utils;
        let mockPeers = [
            {
                id: 'a1',
                val1: '1',
                val2: 1,
            },
            {
                id: 'b2',
                val1: '2',
                val2: 2,
            }
        ];

        it('should be a function', () => {
            assert(typeof validate === 'function');
        });

        it('should accept an object to validate, its peers, and a validation set', () => {
            validate({}, [], {});
        });

        it('should return TRUE if an object is valid', () => {
            assert(validate({}, []) === true);
        });

        it('should return a validation error message if a required value is missing', () => {
            let validation = validate({}, [], {
                required: ['val1']
            });

            assert(typeof validation === 'string');
        });

        it('should return a validation error message if a specified value is not unique amongst peers', () => {
            let validation = validate({val1: '1'}, mockPeers, {
                unique: ['val1']
            });

            assert(typeof validation === 'string');
        });
    });
});
