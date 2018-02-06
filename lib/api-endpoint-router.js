/*!
 * just-write-api
 * Copyright(c) 2018 by Phillip Luther
 * MIT Licensed
 */

'use strict';

const express = require('express');
const endpoints = require('./endpoints');
const {ensureSync} = require('./paths');


module.exports = (contentDir = 'content') => {
    const router = express.Router();

    ensureSync(contentDir);
    return endpoints(router);
};
