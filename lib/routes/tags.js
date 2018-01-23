'use strict';

const fs = require('fs-extra');
const {TAG_DATA} = require('../paths');
const {
    applyFilters,
    handleErrorResponse,
    handleSuccessResponse,
    log,
    StatusError,
} = require('../utils');

let TAG_CACHE = [];


//
function getTags(bustCache = false) {
    return new Promise((resolve, reject) => {

        if (bustCache || (TAG_CACHE.length === 0)) {
            fs.readJson(TAG_DATA).then(tags => {
                TAG_CACHE = tags;
                resolve(tags);
            }).catch(reject);

        } else {
            resolve(TAG_CACHE);
        }
    });
}

//
function getTag(tagId) {
    return getTags().then(tags => {
        let match = tags.filter(tag => tag.id === tagId);

        if (match.length === 0) {
            throw new StatusError(404, `Tag ID ${tagId} not found`);

        } else {
            return match[0];
        }
    });
}

//
//function


//
// ============================================================================
// ============================================================================
// ============================================================================
//
// CRUD Handlers
//

function handleGetRequest(req, res) {
    let {id} = req.params;
    let hasFilters = Object.keys(req.query).length > 0;


    if (id) {
        // throw a warning if an ID'd request contains filters; not used
        if (hasFilters) {
            log('Filters ignored in GET request to specific ID', 'yellow');
        }

        getTag(id)
            .then(tag => handleSuccessResponse(req, res, tag))
            .catch(err => handleErrorResponse(req, res, err));

    } else {
        getTags()
            .then(tags => {

                // account for any query param filters
                if (hasFilters) {
                    handleSuccessResponse(req, res, applyFilters(tags, req.query));
                } else {
                    handleSuccessResponse(req, res, tags);
                }
            })
            .catch(err => handleErrorResponse(req, res, err));
    }
};



module.exports = (router) => {
    router.route('/tags/:id?')
        .get(handleGetRequest);
}
