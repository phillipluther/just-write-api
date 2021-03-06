'use strict';

const assert = require('assert');
const fs = require('fs-extra');
const path = require('path');
const paths = require('../lib/paths');



describe('lib/paths.js', () => {

    function removeTestContent(contentDir) {
        let contentPath = path.join(process.cwd(), contentDir);
        if (contentPath && fs.pathExists(contentPath)) {
            fs.removeSync(contentPath);
        }
    }


    it('should return an object with multiple exports', () => {
        assert(typeof paths === 'object');
    });

    it('should export a method to get the content root', () => {
        assert(typeof paths.getContentPath === 'function');
    });

    it('should export methods for geting paths to our data files', () => {
        assert(typeof paths.getPageDataPath === 'function');
        assert(typeof paths.getTagDataPath === 'function');
    });


    describe('{ensure}', () => {
        // one-off test directory for content; it'll be destroyed after these
        // tests run
        let newContentDir = 'newContent';
        let {ensure} = paths;

        before(() => {
            removeTestContent(newContentDir);
        });

        after(() => {
            removeTestContent(newContentDir);
        });


        it('should be a function', () => {
            assert(typeof ensure === 'function');
        });

        it('should create the content directory and data files if they do not exist', (done) => {
            ensure(newContentDir).then(() => {
                assert(fs.pathExistsSync(paths.getContentPath()));
                assert(fs.pathExistsSync(paths.getTagDataPath()));
                assert(fs.pathExistsSync(paths.getPageDataPath()));

                done();
            }).catch(done);
        });

        it('should return TRUE if the content directory already exists', (done) => {
            ensure(newContentDir).then(exists => {
                assert(exists === true);
                done();

            }).catch(done);
        });
    });

    describe('{ensureSync}', () => {
        let syncContentDir = 'syncContent';
        let {ensureSync} = paths;

        before(() => {
            removeTestContent(syncContentDir);
        });

        after(() => {
            removeTestContent(syncContentDir);
        });


        it('should be a function', () => {
            assert(typeof ensureSync === 'function');
        });

        it('should synchronously create the content directory and data files if they do not exist', () => {
            ensureSync(syncContentDir);

            assert(fs.pathExistsSync(paths.getContentPath()));
            assert(fs.pathExistsSync(paths.getTagDataPath()));
            assert(fs.pathExistsSync(paths.getPageDataPath()));
        });

        it('should return TRUE and do nothing if the content directory already exists', () => {
            assert(ensureSync(syncContentDir) === true);
        });
    });
});
