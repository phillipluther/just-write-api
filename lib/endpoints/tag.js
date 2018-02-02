'use strict';

const fs = require('fs-extra');
const {getTagDataPath} = require('../paths');
const {
    handleErrorResponse,
    handleSuccessResponse,
    log,
    StatusError,
    validate,
} = require('../utils');



module.exports = (router) => router.route('/tag/:id')

    .all((req, res, next) => {
        if (Object.keys(req.query).length > 0) {
            log('Filters ignored', 'yellow');
        }

        return fs.readJson(getTagDataPath())
            .then(tags => {
                let {id} = req.params;
                let matched = tags.filter(t => t.id === id);

                if (matched.length === 0) {
                    throw new StatusError(404, `Tag ID '${id}' not found`);
                }

                req.tag = matched[0];
                req.tags = tags;
                next();
            })
            .catch(err => handleErrorResponse(req, res, err));
    })


    .delete((req, res) => {
        let filteredTags = req.tags.filter(t => t !== req.tag);

        return fs.writeJson(getTagDataPath(), filteredTags)
            .then(() => handleSuccessResponse(req, res, filteredTags))
            .catch(err => handleErrorResponse(req, res, err));
    })


    .get((req, res) => handleSuccessResponse(req, res, req.tag))


    .put((req, res) => {
        let updatedTag = Object.assign({}, req.tag, req.body);

        let validation = validate(updatedTag, req.tags, {
            required: ['name'],
        });

        if (validation !== true) {
            handleErrorResponse(req, res, new StatusError(400, validation));
            return;
        }

        let updatedTags = req.tags.map(t => {
            return (t.id === updatedTag.id) ? updatedTag : t;
        });

        return fs.writeJson(getTagDataPath(), updatedTags)
            .then(() => handleSuccessResponse(req, res, updatedTag))
            .catch(err => handleErrorResponse(req, res, err));
    });
