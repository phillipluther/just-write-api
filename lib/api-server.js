'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const {log} = require('./utils');
const paths = require('./paths');
const endpoints = require('./endpoints');

const DEFAULT_CONF = {
    contentDir: 'content',
    host: 'localhost',
    port: 8001,
};


module.exports = (options = {}, onApiStart) => {
    let conf = Object.assign({}, DEFAULT_CONF, options);

    return paths.ensure(conf.contentDir)
        .then(() => {
            let app = express();
            let router = express.Router();

            app.use(bodyParser.json());
            app.use(bodyParser.urlencoded({
                extended: true
            }));

            // allow incoming requests to the API; we're allowing ALL, so this
            // is worth noting - SHOULD NOT be thrown out on a public-facing
            // app willy-nilly
            app.use((req, res, next) => {
                res.header('Access-Control-Allow-Origin', '*');
                res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
                next();
            });

            // load our endpoints
            app.use(endpoints(router));

            // any request not explicitly handled by the router gets 404'd
            app.get('*', (req, res) => {
                res.status(404).send('Route not supported');
            });

            return app;
        })
        .then(app => {
            app.listen(conf.port, conf.host, () => {
                log(`API running at ${conf.host}:${conf.port}`, 'cyan');

                // optional callback, passing-through the express app for
                // additional setup/extension
                if (onApiStart) {
                    onApiStart(app);
                }
            });
        })
        .catch(log);
};
