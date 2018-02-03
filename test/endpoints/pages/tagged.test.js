'use strict';

const assert = require('assert');
const tagged = require('../../../lib/endpoints/pages/tagged');

const {
    ensureTestContent,
} = require('../../helpers/testContent');

const {
    MockRequest,
    MockResponse,
    MockRouter
} = require('../../helpers/mocks');



describe('lib/endpoints/pages/tagged.js', () => {
    let handler;

    before(done => {
        handler = tagged(new MockRouter());
        ensureTestContent()
            .then(() => done())
            .catch(done);
    });


    it('should be a function', () => {
        assert(typeof tagged === 'function');
    });

    it('should take an Express router param to extend', () => {
        tagged(new MockRouter());
    });


    describe('{get}', () => {
        let req, res;

        beforeEach(() => {
            req = new MockRequest();
            res = new MockResponse();
        });


        it('should return pages tagged wth a given tag ID', (done) => {
            req.params = {tagIds: 't2'};

            handler.get(req, res)
                .then(() => {
                    assert(res.json.length === 2);
                    done();
                })
                .catch(done);
        });

        it('should return pages tagged with multiple tag IDs', (done) => {
            req.params = {tagIds: 't1,t2'};

            handler.get(req, res)
                .then(() => {
                    assert(res.json.length === 1);
                    done();
                })
                .catch(done);
        });

        it('should apply filters to tagged page results', (done) => {
            req.params = {tagIds: 't2'};
            req.query = {title: 'Page3'};

            handler.get(req, res)
                .then(() => {
                    assert(res.json.length === 1);
                    done();
                })
                .catch(done);
        });
    });
});
