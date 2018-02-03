'use strict';

const assert = require('assert');
const tags = require('../../lib/endpoints/tags');


describe('lib/endpoints/tags.js', () => {

    it('should be a function', () => {
        assert(typeof tags === 'function');
    });
});
