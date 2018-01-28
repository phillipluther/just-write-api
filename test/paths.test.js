'use strict';

const assert = require('assert');
const fs = require('fs-extra');
const paths = require('../lib/paths');


describe('lib/paths.js', () => {
    it('should return an object with multiple exports', () => {
        assert(typeof paths === 'object');
    });

    it('should export paths to our content folder and data files', () => {
        assert(typeof paths.CONTENT === 'string');
        assert(typeof paths.TAG_DATA === 'string');
        assert(typeof paths.PAGE_DATA === 'string');
    });


    describe('{ensure}', () => {
        let {ensure} = paths;

        function removeTestContent() {
            fs.removeSync(paths.CONTENT);
        }

        before(removeTestContent);
        after(removeTestContent);


        it('should be a function', () => {
            assert(typeof ensure === 'function');
        });

        it('should create the content directory and data files if they do not exist', (done) => {
            ensure().then(() => {
                assert(fs.pathExistsSync(paths.CONTENT));
                assert(fs.pathExistsSync(paths.TAG_DATA));
                assert(fs.pathExistsSync(paths.PAGE_DATA));

                done();
            }).catch(done);
        });

        it('should return TRUE if the content directory already exists', (done) => {
            ensure().then(exists => {
                assert(exists === true);
                done();

            }).catch(done);
        });
    });
});
