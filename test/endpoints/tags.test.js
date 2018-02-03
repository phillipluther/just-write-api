'use strict';

const fs = require('fs-extra');
const assert = require('assert');
const tags = require('../../lib/endpoints/tags');
const {
    createTestContent,
    ensureTestContent,
    testContentTags
} = require('../helpers/testContent');

const {
    MockRequest,
    MockResponse,
    MockRouter
} = require('../helpers/mocks');


describe('lib/endpoints/tags.js', () => {
    let handler;

    before(done => {
        handler = tags(new MockRouter());
        ensureTestContent()
            .then(() => done())
            .catch(done);
    });


    it('should be a function', () => {
        assert(typeof tags === 'function');
    });

    it('should accept an Express router object to extend', () => {
        tags(new MockRouter());
    });


    describe('{all}', () => {
        let req, res;

        beforeEach(() => {
            createTestContent();
            req = new MockRequest();
            res = new MockResponse();
        });


        it('should fetch and attach all tag data to the request', (done) => {
            handler.all(req, res, () => true)
                .then(() => {
                    assert(typeof req.tags !== 'undefined');
                    assert(Array.isArray(req.tags));
                    done();
                })
                .catch(done);
        });

        it('should pass-through to the next matching request handler', (done) => {
            let nextCalled = false;
            let next = () => nextCalled = true;

            handler.all(req, res, next)
                .then(() => {
                    assert(nextCalled);
                    done();
                })
                .catch(done);
        });

        it('should send a 500 response if it fails to read the data file', (done) => {
            fs.removeSync(testContentTags);

            handler.all(req, res, () => true)
                .then(() => {
                    assert(res.status === 500);
                    assert(typeof res.send === 'string');
                    done();
                })
                .catch(done);
        });
    });


    describe('{get}', () => {
        let req, res;

        beforeEach(() => {
            createTestContent();
            req = new MockRequest({
                query: {},
                tags: fs.readJsonSync(testContentTags)
            });
            res = new MockResponse();
        });


        it('should send a 200 response with an array of tag objects', () => {
            handler.get(req, res);

            assert(res.status === 200);
            assert(Array.isArray(res.json));
            assert(res.json.length === 3);
            assert(typeof res.json[0] === 'object');
        });

        it('should apply filters to the tags result set', () => {
            req.query.filterHook = 'yup';
            handler.get(req, res);

            assert(res.json.length === 2);
            assert(res.json.filter(
                t => t.filterHook === req.query.filterHook).length === 2
            );
        });
    });


    describe('{post}', () => {
        let req, res;

        beforeEach(() => {
            createTestContent();
            req = new MockRequest({
                body: {
                    name: 'Test',
                    customField: 'yup',
                },
                query: {},
                tags: fs.readJsonSync(testContentTags)
            });
            res = new MockResponse();
        });

        it('should fail validation if a `name` property is not provided', () => {
            req.body.name = null;

            handler.post(req, res);
            assert(res.status === 400);
            assert(res.send.indexOf('is required') > -1);
        });

        it('should send a 201 response with the new resource, ID\'d', (done) => {
            handler.post(req, res)
                .then(() => {
                    assert(res.status === 201);
                    assert(typeof res.json === 'object');
                    assert(typeof res.json.id === 'string');
                    assert(res.json.name === 'Test');

                    done();
                })
                .catch(done);
        });

        it('should ignore filters', (done) => {
            req.query.id = 't2';

            handler.post(req, res)
                .then(() => {
                    assert(res.status === 201);
                    assert(res.json.name === 'Test');
                    done();
                })
                .catch(done);
        });
    });

});
