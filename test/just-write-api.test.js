'use strict';

const assert = require('assert');
const justWriteApi = require('../lib/just-write-api');


describe('lib/just-write-api.js', () => {
    let apiRef;

    // helper function to spin up an API server instance; has the same contract
    // as the API itself and simply passes them through and sets our global ref
    // handle
    function startApi(options={}, onApiStart) {
        return new Promise((resolve, reject) => {
            justWriteApi(options, onApiStart).then(api => {
                apiRef = api;
                resolve();
            }).catch(reject);
        });
    }

    // if a server instance is running, close the connection and reset the
    // reference
    afterEach(() => {
        if (apiRef) {
            apiRef.close();
        }

        apiRef = null;
    });


    it('should be a function', () => {
        assert(typeof justWriteApi === 'function');
    });

    it('should spin up with no configuration', (done) => {
        startApi().then(done).catch(done);
    });

    it('should take a custom port via the options param', (done) => {
        let options = {
            port: 1336, // almost ...
        };

        startApi(options).then(() => {
            assert(apiRef.address().port === 1336);
            done();
        }).catch(done);
    });

    it('should take a custom host via the options param', (done) => {
        let options = {
            host: '127.0.0.5',
        };

        startApi(options).then(() => {
            assert(apiRef.address().address === '127.0.0.5');
            done();
        }).catch(done);
    });

    it('should take a custom callback executed when the server has started', (done) => {
        let callbackCalled = false;
        let callCallback = () => {
            callbackCalled = true;
        };

        startApi({}, callCallback).then(() => {
            assert(callbackCalled === true);
            done();
        }).catch(done);
    });
});
