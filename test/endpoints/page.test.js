'use strict';

const fs = require('fs-extra');
const assert = require('assert');
const page = require('../../lib/endpoints/page');

const {
    createTestContent,
    ensureTestContent,
    testContentPages
} = require('../helpers/testContent');

const {
    MockRequest,
    MockResponse,
    MockRouter
} = require('../helpers/mocks');



describe('lib/endpoints/page.js', () => {
    let handler;

    //
    function createRequest(providePageData) {
        let req = new MockRequest({
            params: {
                id: 'p1',
            },
            query: {},
        });

        if (providePageData) {
            req.pages = fs.readJsonSync(testContentPages);
            req.page = req.pages[0];
        }

        return req;
    }

    before(done => {
        handler = page(new MockRouter());
        ensureTestContent()
            .then(() => done())
            .catch(done);
    });

    it('should be a function', () => {
        assert(typeof page === 'function');
    });

    it('should accept an Express router object to extend', () => {
        page(new MockRouter());
    });


    describe('{all}', () => {
        let req, res;

        beforeEach(() => {
            createTestContent();
            req = createRequest();
            res = new MockResponse;
        });

        it('should pre-fetch all page data and attach it to the request', (done) => {
            handler.all(req, res, () => true)
                .then(() => {
                    let pages = req.pages;

                    assert(typeof pages !== 'undefined');
                    assert(Array.isArray(pages));
                    // random grab to ensure it's reading our pages
                    let random = Math.floor(Math.random() * pages.length);
                    assert(pages[random].id = `p${random}`);

                    done();
                })
                .catch(done);
        });

        it('should pre-fetch the page and attach it to the request', (done) => {
            handler.all(req, res, () => true)
                .then(() => {
                    let page = req.page;

                    assert(typeof page !== 'undefined');
                    assert(page.id === 'p1');
                    done();
                })
                .catch(done);
        });

        it('should respond with a 404 error if a request ID is not found', (done) => {
            req.params.id = 'gibberish';

            handler.all(req, res, () => true)
                .then(() => {
                    assert(res.status === 404);
                    done();
                })
                .catch(done);
        });

        it('should pass-through to the next matching request handler', (done) => {
            let nextCalled = false;
            let callNext = () => nextCalled = true;

            handler.all(req, res, callNext)
                .then(() => {
                    assert(nextCalled === true);
                    done();
                })
                .catch(done);
        });
    });


    describe('{delete}', () => {
        let req, res;

        beforeEach(() => {
            createTestContent();
            req = createRequest(true);
            res = new MockResponse();
        });


        it('should be a function', () => {
            assert(typeof handler.delete === 'function');
        });

        it('should take an express request and response object', () => {
            handler.delete(req, res);
        });

        it('should delete the specified object from the data file', (done) => {
            handler.delete(req, res)
                .then(() => {
                    let updatedPages = fs.readJsonSync(testContentPages);
                    let match = updatedPages.filter(p => p.id === req.page.id);

                    assert(updatedPages.length === 2);
                    assert(match.length === 0);

                    done();
                })
                .catch(done);
        });

        it('should send a 200 response and the updated pages JSON on success', (done) => {
            handler.delete(req, res)
                .then(() => {
                    assert(res.status === 200);
                    assert(res.json.length === 2);
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
            res = new MockResponse();
        });


        it('should be a function', () => {
            assert(typeof handler.get === 'function');
        });

        it('should take an express request and response object', () => {
            handler.get(req, res);
        });

        it('should send a 200 response and the requested object on success', () => {
            handler.get(req, res);

            assert(res.status === 200);
            assert(typeof res.json === 'object');

            // not really doing anything, as mock page data is provided and the GET
            // handler itself isn't doing the needle/haystack search ... upstream
            // ALL is.
            assert(res.json.id === req.params.id);
        });
    });


    describe('{put}', () => {
        let req, res;

        beforeEach(() => {
            createTestContent();
            req = createRequest(true);
            res = new MockResponse();
        });


        it('should be a function', () => {
            assert(typeof handler.put === 'function');
        });

        it('should take an express request and response object', () => {
            handler.put(req, res);
        });

        it('should fail validation if a `title` property is not provided', () => {
            req.page.title = null;

            // validation fails before our async processes kicked off; nothing to
            // await
            handler.put(req, res);

            assert(res.status === 400);
            assert(typeof res.send === 'string');
        });

        it('should fail validation if a `content` property is not provided', () => {
            req.page.content = '';
            handler.put(req, res);

            assert(res.status === 400);
            assert(typeof res.send === 'string');
        });

        it('should send a 200 response with the updated, time-stamped resource on success', (done) => {
            req.page.title = 'Updated Title';

            handler.put(req, res)
                .then(() => {
                    assert(res.status === 200);
                    assert(res.json.title === 'Updated Title');
                    assert(res.json.updated instanceof Date);

                    done();
                })
                .catch(done);
        });

        it('should update the data file on success', (done) => {
            req.page.title = 'WRITTEN';

            handler.put(req, res)
                .then(() => {
                    let updatedJson = fs.readJsonSync(testContentPages);

                    assert(updatedJson[0].title === 'WRITTEN');
                    done();
                })
                .catch(done);
        });
    });
});
