'use strict';

const fs = require('fs-extra');
const assert = require('assert');
const pages = require('../../../lib/endpoints/pages');

const {
    createTestContent,
    ensureTestContent,
    testContentPages
} = require('../../helpers/testContent');

const {
    MockRequest,
    MockResponse,
    MockRouter
} = require('../../helpers/mocks');



describe('lib/endpoints/pages/index.js (/pages)', () => {
    let handler;

    //
    function createRequest(providePageData) {
        let req = new MockRequest({
            params: {},
            query: {},
        });

        if (providePageData) {
            req.pages = fs.readJsonSync(testContentPages);
        }

        return req;
    }

    before(done => {
        handler = pages(new MockRouter());
        ensureTestContent()
            .then(() => done())
            .catch(done);
    });


    it('should be a function', () => {
        assert(typeof pages === 'function');
    });

    it('should accept an Express router object to extend', () => {
        pages(new MockRouter());
    });


    describe('{all}', () => {
        let req, res;

        beforeEach(() => {
            createTestContent();
            req = createRequest();
            res = new MockResponse;
        });

        it('should pre-fetch and append page data to the request', (done) => {
            handler.all(req, res, () => true)
                .then(() => {
                    assert(typeof req.pages !== 'undefined');
                    assert(req.pages.length === 3);

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

        it('should send a 500 response on failing to read the data file', (done) => {
            fs.removeSync(testContentPages);

            handler.all(req, res)
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
            req = createRequest(true);
            res = new MockResponse;
        });

        it('should send a 200 response with page data', () => {
            handler.get(req, res);

            assert(res.status === 200);
            assert(res.json.length === 3);
        });

        it('should apply field-level filters for narrowing results', () => {
            req.query = {
                custom: 'hi'
            };

            handler.get(req, res);

            assert(res.status === 200);
            assert(res.json.length === 2);
        });

        it('should handle multiple field-level filters as conjunctions', () => {
            req.query = {
                custom: 'hi',
                tags: 't2',
            };

            handler.get(req, res);

            assert(res.status === 200);
            assert(res.json.length === 1);
        });
    });


    describe('{post}', () => {
        let req, res;

        beforeEach(() => {
            createTestContent();
            req = createRequest(true);
            res = new MockResponse;

            req.body = {
                title: 'test',
                content: 'test content',
            };
        });

        it('should ignore filters', (done) => {
            req.query.tags = 't2';

            handler.post(req, res)
                .then(() => {
                    assert(res.status === 201);
                    done();
                })
                .catch(done);
        });

        it('should fail validation if a `title` property is not provided', () => {
            req.body.title = null;

            handler.post(req, res);

            assert(res.status === 400);
            assert(res.send.indexOf('is required') > -1);
        });

        it('should fail validation if a `content` property is not provided', () => {
            req.body.content = '';

            handler.post(req, res);
            assert(res.status === 400);
            assert(res.send.indexOf('is required') > -1);
        });

        it('should send a 201 response with a time-stamped and ID\'d resource', (done) => {
            handler.post(req, res)
                .then(() => {
                    assert(res.status === 201);
                    assert((typeof res.json === 'object') && (Array.isArray(res.json) === false));
                    assert(typeof res.json.id === 'string');
                    assert(res.json.created instanceof Date);

                    done();
                })
                .catch(done);
        });

        it('should update the data file on success', (done) => {
            handler.post(req, res)
                .then(() => {
                    let pages = fs.readJsonSync(testContentPages);

                    assert(pages.length === 4);
                    assert(pages.filter(p => p.id === res.json.id).length === 1);
                    done();
                })
                .catch(done);
        });

    });

});
