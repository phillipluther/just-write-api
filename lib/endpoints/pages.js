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


module.exports = (router) => {
    router.route('/pages')

        .all((req, res, next) => fs.readJson(PAGE_DATA)
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

            return fs.writeJson(PAGE_DATA, pages)
                .then(() => handleSuccessResponse(req, res, page, 201))
                .catch(err => handleErrorResponse(req, res, err));
        });


    router.get('/pages/tagged/:tagIds', (req, res) => {
        let tagIds = req.params.tagIds.split(',');

        return fs.readJson(PAGE_DATA)
            .then(pages => {
                let pagesTagged = pages.filter(page => {
                    let isTagged = true;

                    tagIds.forEach(tagId => {
                        if (!page.tags) {
                            isTagged = false;

                        } else if (page.tags.split(',').indexOf(tagId) === -1) {
                            isTagged = false;
                        }
                    });

                    return isTagged;
                });

                handleSuccessResponse(req, res, pagesTagged);
            })
            .catch(err => handleErrorResponse(req, res, err));
    });
};
