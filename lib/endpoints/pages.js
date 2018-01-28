'use strict';

const fs = require('fs-extra');
const shortid = require('shortid');
const {PAGE_DATA} = require('../paths');
const {
    applyFilters,
    handleErrorResponse,
    handleSuccessResponse,
    log,
    StatusError,
    validate,
} = require('../utils');


module.exports = (router) => router.route('/pages')

    .all((req, res, next) => fs.readJson(PAGE_DATA)
        .then(pageData => {
            req.pageData = pageData;
            next();
        })
        .catch(err => handleErrorResponse(req, res, err))
    )


    .get((req, res) => {
        let pages = applyFilters(req.pageData, req.query);
        handleSuccessResponse(req, res, pages);
    })


    .post((req, res) => {
        if (Object.keys(req.query).length > 0) {
            log('Filters ignored', 'yellow');
        }

        let pageData = req.pageData.slice();
        let id = shortid.generate();
        let page = Object.assign({}, req.body, {
            id,
            created: new Date(),
        });

        let validation = validate(page, pageData, {
            required: ['content', 'filename', 'title'],
            unique: ['filename'],
        });

        if (validation !== true) {
            handleErrorResponse(req, res, new StatusError(400, validation));
            return;
        }

        pageData.push(page);

        return fs.writeJson(PAGE_DATA, pageData)
            .then(() => handleSuccessResponse(req, res, pageData, 201))
            .catch(err => handleErrorResponse(req, res, err));
    });
