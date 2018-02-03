'use strict';

const fs = require('fs-extra');
const shortid = require('shortid');
const {getPageDataPath} = require('../../paths');
const {
    applyFilters,
    handleErrorResponse,
    handleSuccessResponse,
    log,
    StatusError,
    validate,
} = require('../../utils');


module.exports = (router) => router.route('/pages')

    .all((req, res, next) => fs.readJson(getPageDataPath())
        .then(pages => {
            req.pages = pages;
            next();
        })
        .catch(err => handleErrorResponse(req, res, err))
    )


    .get((req, res) => {
        let pages = applyFilters(req.pages, req.query);
        handleSuccessResponse(req, res, pages);
    })


    .post((req, res) => {
        if (Object.keys(req.query).length > 0) {
            log('Filters ignored', 'yellow');
        }

        let pages = req.pages.slice();
        let id = shortid.generate();
        let page = Object.assign({}, req.body, {
            id,
            created: new Date(),
        });

        let validation = validate(page, pages, {
            required: ['content', 'title'],
        });

        if (validation !== true) {
            handleErrorResponse(req, res, new StatusError(400, validation));
            return;
        }

        pages.push(page);

        return fs.writeJson(getPageDataPath(), pages)
            .then(() => handleSuccessResponse(req, res, page, 201))
            .catch(err => handleErrorResponse(req, res, err));
    });
