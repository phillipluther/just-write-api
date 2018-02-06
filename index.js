/*!
 * just-write-api
 * Copyright(c) 2018 by Phillip Luther
 * MIT Licensed
 */

'use strict';

// expose the endpoint module, which takes an Express router instance and extends
// it with the API functionality. intended use is assimilating the API into
// other servers
exports.endpointRouter = require('./lib/api-endpoint-router');

// expose the stand-alone API which runs on its own server and port
exports.server = require('./lib/api-server');
