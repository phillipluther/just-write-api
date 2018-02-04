'use strict';

const fs = require('fs-extra');
const assert = require('assert');
const tag = require('../../lib/endpoints/tag');

const {
    cleanTestContent,
    createTestContent,
    setTestContentPath,
    testContentTags
} = require('../helpers/testContent');

const {
    MockRequest,
    MockResponse,
    MockRouter
} = require('../helpers/mocks');



describe('lib/endpoints/tag.js', () => {
    let handler;

    //
    function createRequest(provideTagData) {
        let req = new MockRequest({
            params: {
                id: 't1',
            },
            query: {},
        });

        if (provideTagData) {
            req.tags = fs.readJsonSync(testContentTags);
            req.tag = req.tags[0];
        }

        return req;
    }

    before(done => {
        handler = tag(new MockRouter());
        setTestContentPath()
            .then(() => done())
            .catch(done);
    });

    after(cleanTestContent);


    it('should be a function', () => {
        assert(typeof tag === 'function');
    });

    it('should accept an Express router object to extend', () => {
        tag(new MockRouter());
    });


    describe('{all}', () => {
        let req, res;

        beforeEach(() => {
            createTestContent();
            req = createRequest();
            res = new MockResponse();
        });


        it('should fetch and attach an array of tag data to the request', (done) => {
            handler.all(req, res, () => true)
                .then(() => {
                    assert(typeof req.tags !== 'undefined');
                    assert(Array.isArray(req.tags));
                    assert(req.tags.length === 3);
                    done();
                })
                .catch(done);
        });

        it('should attach tag data to the request for the requested tag', (done) => {
            handler.all(req, res, () => true)
                .then(() => {
                    assert(typeof req.tag !== 'undefined');
                    assert(req.tag.id === 't1');
                    done();
                })
                .catch(done);
        });

        it('should ignore filters', (done) => {
            req.query = {id:'t1'};

            handler.all(req, res, () => true)
                .then(() => {
                    assert(req.tags.length === 3);
                    done();
                })
                .catch(done);
        });

        it('should send a 404 response if the requested tag is not found', (done) => {
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
            let next = () => nextCalled = true;

            handler.all(req, res, next)
                .then(() => {
                    assert(nextCalled);
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


        it('should remove the requested tag from the data file', (done) => {
            handler.delete(req, res)
                .then(() => {
                    let tags = fs.readJsonSync(testContentTags);

                    assert(tags.length === 2);
                    assert(tags.filter(t => t.id === req.params.id).length === 0);
                    done();
                })
                .catch(done);
        });

        it('should send a 200 response with the updated tag listing on success', (done) => {
            handler.delete(req, res)
                .then(() => {
                    assert(res.status === 200);
                    assert(res.json.length === 2);
                    assert(res.json.filter(t => t.id === req.params.id).length === 0);

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

        it('should send a 200 response with the specified tag object', () => {
            handler.get(req, res);
            assert(res.status === 200);
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


        it('should fail validation if a `name` property is not provided', () => {
            req.body = {
                name: null,
            };
            handler.put(req, res);

            assert(res.status === 400);
            assert(res.send.indexOf('is required') > -1);
        });

        it('should update the data file on success', (done) => {
            req.body = {
                name: 'CHANGED',
            };

            handler.put(req, res)
                .then(() => {
                    let tags = fs.readJsonSync(testContentTags);
                    let updated = tags.filter(t => t.id === req.params.id)[0];

                    assert(tags.length === 3);
                    assert(updated.name === 'CHANGED');

                    done();
                })
                .catch(done);
        });

        it('should send a 200 response with the updated object on success', (done) => {
            req.body = {
                name: 'DIFFERENT',
            };

            handler.put(req, res)
                .then(() => {
                    assert(res.status === 200);
                    assert(res.json.name === 'DIFFERENT');
                    done();
                })
                .catch(done);
        });
    });
});
