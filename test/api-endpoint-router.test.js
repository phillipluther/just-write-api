'use strict';

const assert = require('assert');
const fs = require('fs-extra');
const path = require('path');
const endpointRouter = require('../lib/api-endpoint-router');


describe('lib/api-endpoint-router.js', () => {
    let contentDir = 'routerTestDir';

    function removeContentDir() {
        fs.removeSync(
            path.join(process.cwd(), contentDir)
        );
    }


    beforeEach(() => {
        removeContentDir();
    });

    after(() => {
        removeContentDir();
    });


    it('should be a function', () => {
        assert(typeof endpointRouter === 'function');
    });

    it('should synchronously ensure the given content folder exists', () => {
        endpointRouter(contentDir);

        assert(fs.pathExistsSync(
            path.join(process.cwd(), contentDir)
        ));
    });

    it('should return an Express router instance', () => {
        let returnValue = endpointRouter(contentDir);

        assert(typeof returnValue.delete === 'function');
        assert(typeof returnValue.get === 'function');
        assert(typeof returnValue.post === 'function');
        assert(typeof returnValue.put === 'function');
    });
});
