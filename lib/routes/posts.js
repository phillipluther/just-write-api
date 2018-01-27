'use strict';

const Route = require('./Route');
const {POST_DATA} = require('../paths');

const posts = new Route(POST_DATA, {
    requiredFields: ['content', 'filename', 'title'],
    uniqueFields: ['filename'],
});


module.exports = (router) => {
    router.route('/posts/:id?')
        .delete(posts.handleDelete)
        .get(posts.handleGet)
        .post(posts.handlePost)
        .put(posts.handlePut);
};
