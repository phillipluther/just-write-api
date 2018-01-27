'use strict';

const fs = require('fs-extra');
const shortid = require('shortid');
const {
    applyFilters,
    handleErrorResponse,
    handleSuccessResponse,
    hasValue,
    log,
    StatusError,
} = require('../utils');


module.exports = function Route(_dataSrc, _options={}) {

    //
    // =========================================================================
    // Init Actions
    //
    this.data = [];

    let passThrough = d => d;
    // set some default options
    _options = Object.assign({
        deleteHook: passThrough,
        getHook: passThrough,
        postHook: passThrough,
        putHook: passThrough,

        requiredFields: [],
        timestamp: true,
        uniqueFields: [],
    }, _options);

    //
    // =========================================================================
    // Private Methodds
    //
    const getData = (bustCache = false) => {
        return new Promise((resolve, reject) => {

            if (bustCache || (this.data.length === 0)) {
                fs.readJson(_dataSrc).then(data => {
                    this.data = data;
                    resolve(data);
                }).catch(reject);

            } else {
                resolve(this.data);
            }
        });
    };

    //
    const getDataItem = (id) => {
        return getData().then(data => {
            let match = data.filter(d => d.id === id);

            if (match.length === 0) {
                throw new StatusError(404, `ID ${id} not found`);

            } else {
                return match[0];
            }
        });
    };

    //
    const throwFilterWarning = (filters={}) => {
        if (Object.keys(filters).length > 0) {
            log('Ignoring filters', 'yellow');
        }
    };

    // helper function for validating data, ensuring required fields have
    // values and fields that need to be unique are, in fact, unique.
    //
    // returns TRUE if the given data is valid, or an error message (string) if
    // not
    const validate = (dataItem, data) => {
        let {requiredFields, uniqueFields} = _options;
        let validation = true;

        requiredFields.forEach(field => {
            if (hasValue(dataItem[field]) === false) {
                validation = `'${field}' is required`;
            }
        });

        // bail if we've already failed; the next operation is more expensive
        if (validation !== true) {
            return validation;
        }

        uniqueFields.forEach(field => {
            let otherVals = data.map(d => {
                if (d.id !== dataItem.id) {
                    return d[field];
                }
            });

            if (otherVals.indexOf(dataItem[field]) > -1) {
                validation = `${field} '${dataItem[field]}' already exists`;
            }
        });

        return validation;
    };


    //
    // =========================================================================
    // CRUD Handlers
    //
    this.handleDelete = (req, res) => {
        let {deleteHook} = _options;
        let {id} = req.params;
        throwFilterWarning(req.query);

        if (!id) {
            let err = new StatusError(400, 'ID is required');
            handleErrorResponse(req, res, err);
            return;
        }

        let deletedItem;
        getData(true)
            .then(data => {
                deletedItem = data.filter(d => d.id === id)[0];

                if (!deletedItem) {
                    throw new StatusError(404, `ID '${id}' not found`);
                }

                let deletedIndex = this.data.indexOf(deletedItem);
                this.data.splice(deletedIndex, 1);
            })
            .then(() => fs.writeJson(_dataSrc, this.data))
            .then(() => handleSuccessResponse(req, res, this.data))
            .then(() => deleteHook(deletedItem))
            .catch(err => handleErrorResponse(req, res, err));
    };

    this.handleGet = (req, res) => {
        let {getHook} = _options;
        let {id} = req.params;
        let hasFilters = Object.keys(req.query).length > 0;

        let responseData;

        if (id) {
            // throw a warning if an ID'd request contains filters; not used
            throwFilterWarning(req.query);

            getDataItem(id)
                .then(dataItem => {
                    responseData = dataItem;
                    handleSuccessResponse(req, res, dataItem);
                })
                .then(() => getHook(responseData))
                .catch(err => handleErrorResponse(req, res, err));

        } else {
            getData()
                .then(data => {
                    responseData = (hasFilters) ?
                        applyFilters(data, req.query) :
                        data;

                    handleSuccessResponse(req, res, responseData);
                })
                .then(() => getHook(responseData))
                .catch(err => handleErrorResponse(req, res, err));
        }
    };

    this.handlePost = (req, res) => {
        let {postHook, timestamp} = _options;
        let {id} = req.params;
        throwFilterWarning(req.query);

        if (id) {
            let err = new StatusError(405, 'POST to specific ID not supported; use PUT instead');
            handleErrorResponse(req, res, err);
            return;
        }

        let dataItem = Object.assign({}, req.body, {
            id: shortid.generate(), // internal ID trumps all
        });

        if (timestamp) {
            dataItem.created = new Date();
        }

        getData()
            .then(data => {
                let validation = validate(dataItem, data);
                if (validation !== true) {
                    throw new StatusError(400, validation);
                }

                this.data.push(dataItem);
            })
            .then(() => fs.writeJson(_dataSrc, this.data))
            .then(() => handleSuccessResponse(req, res, this.data, 201))
            .then(() => postHook(dataItem))
            .catch(err => handleErrorResponse(req, res, err));
    };

    this.handlePut = (req, res) => {
        let {putHook, timestamp} = _options;
        let {id} = req.params;
        throwFilterWarning(req.query);

        if (!id) {
            let err = new StatusError(400, 'ID is required');
            handleErrorResponse(req, res, err);
            return;
        }

        let updated;

        getDataItem(id)
            .then(dataItem => {
                let updated = Object.assign(dataItem, req.body, {id});
                if (timestamp) {
                    updated.updated = new Date();
                }

                let validation = validate(updated, this.data);
                if (validation !== true) {
                    throw new StatusError(400, validation);
                }

                this.data = this.data.map(d => (d.id === id) ? updated : d);
            })
            .then(() => fs.writeJson(_dataSrc, this.data))
            .then(() => handleSuccessResponse(req, res, this.data))
            .then(() => putHook(updated))
            .catch(err => handleErrorResponse(req, res, err));
    };
};
