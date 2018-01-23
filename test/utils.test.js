'use strict';

const assert = require('assert');
const utils = require('../lib/utils');
const colors = require('colors/safe');


describe('lib/utils.js', () => {
    it('return an object of utilities', () => {
        assert(typeof utils === 'object');
    });


    describe('{ApiError}', () => {
        let {ApiError} = utils;
        let instance;

        beforeEach(() => {
            instance = new ApiError();
        });

        it('should be a constructor function', () => {
            assert(typeof ApiError === 'function');
            assert(instance instanceof ApiError);
        });

        it('should contain default status, message, and request properties', () => {
            assert(typeof instance.status === 'number');
            assert(typeof instance.message === 'string');
            assert(typeof instance.request === 'string');
        });

        it('should take custom status, message, and request properties', () => {
            instance = new ApiError(999, 'Test message', {
                path: 'test',
            });

            assert(instance.status === 999);
            assert(instance.message === 'Test message');
            assert(instance.request === 'UNKNOWN test');
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
