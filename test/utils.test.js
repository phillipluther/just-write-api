'use strict';

const assert = require('assert');
const utils = require('../lib/utils');
const colors = require('colors/safe');
const {MockRequest, MockResponse} = require('./env');


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
});
