'use strict';

const fs = require('fs-extra');
const shortid = require('shortid');
const {TAG_DATA} = require('../paths');
const {
    applyFilters,
    handleErrorResponse,
    handleSuccessResponse,
    log,
    StatusError,
    validate,
} = require('../utils');


module.exports = (router) => router.route('/tags')

    .all((req, res, next) => fs.readJson(TAG_DATA)
        .then(tags => {
            req.tags = tags;
            next();
        })
        .catch(err => handleErrorResponse(req, res, err))
    )


    .get((req, res) => {
        let tags = applyFilters(req.tags, req.query);
        handleSuccessResponse(req, res, tags);
    })


    .post((req, res) => {
        if (Object.keys(req.query).length > 0) {
            log('Filters ignored', 'yellow');
        }

        let tags = req.tags.slice();
        let id = shortid.generate();
        let tag = Object.assign({}, req.body, {id});

        let validation = validate(tag, tags, {
            required: ['name', 'slug'],
            unique: ['slug'],
        });

        if (validation !== true) {
            handleErrorResponse(req, res, new StatusError(400, validation));
            return;
        }

        tags.push(tag);

        return fs.writeJson(TAG_DATA, tags)
            .then(() => handleSuccessResponse(req, res, tag, 201))
            .catch(err => handleErrorResponse(req, res, err));
    });
