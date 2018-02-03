'use strict';

const fs = require('fs-extra');
const {getPageDataPath} = require('../../paths');
const {
    applyFilters,
    handleErrorResponse,
    handleSuccessResponse,
} = require('../../utils');


module.exports = (router) => router.route('/pages/tagged/:tagIds')
    .get((req, res) => {
        let tagIds = req.params.tagIds.split(',');

        return fs.readJson(getPageDataPath())
            .then(pages => {
                pages = applyFilters(pages, req.query);

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
