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
    let endpoint, fakeRouter, fakeRequest, fakeResponse, pageData;

    //
    function augmentRequest() {
        let pages = pageData;

        if (!pages) {
            pages = fs.readJsonSync(testContentPages);
            pageData = pages;
        }

        let random = Math.floor(Math.random() * pages.length);
        let page = pages[random];

        fakeRequest.page = page;
        fakeRequest.pages = pages;
    }


    before(done => {
        ensureTestContent()
            .then(() => done())
            .catch(done);
    });

    beforeEach(() => {
        createTestContent();

        fakeRouter = new MockRouter();
        fakeResponse = new MockResponse();
        fakeRequest = new MockRequest({
            params: {
                id: 'p1',
            },
            query: {},
        });

        endpoint = page(fakeRouter);
    });

    it('should be a function', () => {
        assert(typeof page === 'function');
    });

    it('should accept an Express router object to extend', () => {
        page(new MockRouter());
    });


    describe('{all}', () => {

        it('should pre-fetch all page data, appending the req', (done) => {
            endpoint.all(fakeRequest, fakeResponse, () => true)
                .then(() => {
                    let pages = fakeRequest.pages;

                    assert(typeof pages !== 'undefined');
                    assert(Array.isArray(pages));
                    // random grab to ensure it's reading our pages
                    let random = Math.floor(Math.random() * pages.length);
                    assert(pages[random].id = `p${random}`);

                    done();
                })
                .catch(done);
        });

        it('should pre-fetch the page by ID, appending the req', (done) => {
            endpoint.all(fakeRequest, fakeResponse, () => true)
                .then(() => {
                    let page = fakeRequest.page;

                    assert(typeof page !== 'undefined');
                    assert(page.id === 'p1');
                    done();
                })
                .catch(done);
        });

        it('should respond with a 404 error if a given ID is not found', (done) => {
            fakeRequest.params.id = 'gibberish';

            endpoint.all(fakeRequest, fakeResponse, () => true)
                .then(() => {
                    assert(fakeResponse.status === 404);
                    done();
                })
                .catch(done);
        });

        it('should pass-through to the next matching request handler', (done) => {
            let nextCalled = false;
            let callNext = () => nextCalled = true;

            endpoint.all(fakeRequest, fakeResponse, callNext)
                .then(() => done())
                .catch(done);
        });
    });


    describe('{delete}', () => {
        beforeEach(augmentRequest);

        it('should be a function', () => {
            assert(typeof endpoint.delete === 'function');
        });

        it('should take an express request and response object', () => {
            endpoint.delete(fakeRequest, fakeResponse);
        });

        it('should delete the specified page by ID', (done) => {
            endpoint.delete(fakeRequest, fakeResponse)
                .then(() => {
                    let updatedPages = fs.readJsonSync(testContentPages);
                    let match = updatedPages.filter(p => p.id === fakeRequest.page.id);

                    assert(updatedPages.length === 2);
                    assert(match.length === 0);

                    done();
                })
                .catch(done);
        });

        it('should send a 200 response and the updated pages JSON on success', (done) => {
            endpoint.delete(fakeRequest, fakeResponse)
                .then(() => {
                    assert(fakeResponse.status === 200);
                    assert(fakeResponse.json.length === 2);
                    done();
                })
                .catch(done);
        });
    });


    describe('{get}', () => {
        beforeEach(augmentRequest);

        it('should be a function', () => {
            assert(typeof endpoint.get === 'function');
        });

        it('should take an express request and response object', () => {
            endpoint.get(fakeRequest, fakeResponse);
        });

        it('should send a 200 response and the requested object', () => {
            endpoint.get(fakeRequest, fakeResponse);

            assert(fakeResponse.status === 200);
            assert(fakeResponse.json.id === fakeRequest.params.id);
        });
    });
});
