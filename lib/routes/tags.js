'use strict';

const fs = require('fs-extra');
const shortid = require('shortid');
const {TAG_DATA} = require('../paths');
const {
    applyFilters,
    handleErrorResponse,
    handleSuccessResponse,
    hasValue,
    log,
    StatusError,
} = require('../utils');

let TAG_CACHE = [];


// helper function for validating tag data, ensuring required fields have values
// and fields that need to be unique are, in fact, unique.
//
// returns TRUE if the given tag is valid, or an error message (string) if not
function validateTag(tag, tags) {
    let required = ['name', 'slug'];
    let unique = ['slug'];
    let validation = true;

    required.forEach(field => {
        if (hasValue(tag[field]) === false) {
            validation = `Tag '${field}' is required`;
        }
    });

    // bail if we've already failed; the next operation is more expensive
    if (validation !== true) {
        return validation;
    }

    unique.forEach(field => {
        let otherVals = tags.map(t => {
            if (t.id !== tag.id) {
                return t[field];
            }
        });

        if (otherVals.indexOf(tag[field]) > -1) {
            validation = `Tag ${field} '${tag[field]}' already exists`;
        }
    });

    return validation;
}


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
}

function handlePostRequest(req, res) {
    let {id} = req.params;
    let hasFilters = Object.keys(req.query).length > 0;

    if (id) {
        let err = new StatusError(405, 'POST to specific ID not supported. Use PUT instead.');
        handleErrorResponse(req, res, err);
        return;
    }

    if (hasFilters) {
        log('Filters ignored in POST requests.', 'yellow');
    }

    let tags;
    let tag = Object.assign({}, req.body, {
        id: shortid.generate(), // internal ID trumps all
    });

    getTags()
        .then(tagData => {
            tags = tagData;

            let validation = validateTag(tag, tags);
            if (validation !== true) {
                throw new StatusError(400, validation);
            }

            tags.push(tag);
        })
        .then(() => fs.writeJson(TAG_DATA, tags))
        .then(() => handleSuccessResponse(req, res, tags, 201))
        .catch(err => handleErrorResponse(req, res, err));
}



module.exports = (router) => {
    router.route('/tags/:id?')
        .get(handleGetRequest)
        .post(handlePostRequest);
};
