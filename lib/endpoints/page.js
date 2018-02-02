'use strict';

const fs = require('fs-extra');
const {getPageDataPath} = require('../paths');
const {
    handleErrorResponse,
    handleSuccessResponse,
    log,
    StatusError,
    validate,
} = require('../utils');



module.exports = (router) => router.route('/page/:id')

    .all((req, res, next) => {

        // ignore any provided filters; actions on specific ID resources don't
        // use them
        if (Object.keys(req.query).length > 0) {
            log('Filters ignored', 'yellow');
        }

        return fs.readJson(getPageDataPath())
            .then(pageData => {
                //console.log('\n\nWHAT I GOT/WHERE I GOT IT', pageData, PAGE_DATA, '\n\n');
                let {id} = req.params;
                let matched = pageData.filter(p => p.id === id);

                if (matched.length === 0) {
                    throw new StatusError(404, `Page ID '${id}' not found`);
                }

                req.page = matched[0];
                req.pages = pageData;
                next();
            })
            .catch(err => handleErrorResponse(req, res, err));
    })


    .delete((req, res) => {
        let filteredPages = req.pages.filter(p => p !== req.page);

        return fs.writeJson(getPageDataPath(), filteredPages)
            .then(() => handleSuccessResponse(req, res, filteredPages))
            .catch(err => handleErrorResponse(req, res, err));
    })


    .get((req, res) => handleSuccessResponse(req, res, req.page))


    .put((req, res) => {
        let updatedPage = Object.assign({}, req.page, req.body, {
            updated: new Date(),
        });

        let validation = validate(updatedPage, req.pages, {
            required: ['content', 'title'],
        });

        if (validation !== true) {
            handleErrorResponse(req, res, new StatusError(400, validation));
            return;
        }

        let updatedPages = req.pages.map(p => {
            return (p.id === updatedPage.id) ? updatedPage : p;
        });

        return fs.writeJson(getPageDataPath(), updatedPages)
            .then(() => handleSuccessResponse(req, res, updatedPage))
            .catch(err => handleErrorResponse(req, res, err));
    });
