'use strict';

const Route = require('./Route');
const {TAG_DATA} = require('../paths');

const tags = new Route(TAG_DATA, {
    timestamp: false,
    requiredFields: ['name', 'slug'],
    uniqueFields: ['slug'],
});


module.exports = (router) => {
    router.route('/tags/:id?')
        .delete(tags.handleDelete)
        .get(tags.handleGet)
        .post(tags.handlePost)
        .put(tags.handlePut);
};
