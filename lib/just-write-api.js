'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const {log} = require('./utils');
const paths = require('./paths');

const DEFAULT_CONF = {
    contentDir: 'content',
    host: 'localhost',
    port: 8001,
};


// TODO revisit all this; it seems overly complicated


module.exports = (options = {}, onApiStart) => {
    let conf = Object.assign({}, DEFAULT_CONF, options);

    //process.env.CONTENT_DIR = conf.contentDir;

    return paths.ensure(conf.contentDir)
        .then(() => {
            let app = express();
            let router = express.Router();

            app.use(bodyParser.json());
            app.use(bodyParser.urlencoded({
                extended: true
            }));

            // load our endpoints
            require('./endpoints/pages')(router);
            require('./endpoints/page')(router);
            require('./endpoints/tags')(router);
            require('./endpoints/tag')(router);

            app.use(router);

            // any request not explicitly handled by the router gets 404'd
            app.get('*', (req, res) => {
                res.status(404).send('Route not supported');
            });

            return app;
        })
        .then(app => new Promise((resolve, reject) => {
            let server;

            try {
                server = app.listen(conf.port, conf.host, () => {
                    log(`API running at ${conf.host}:${conf.port}`, 'green');

                    // optional callback, passing-through the express app for
                    // additional setup/extension
                    if (onApiStart) {
                        onApiStart(app);
                    }

                    resolve(server);
                });

            } catch(err) {
                reject(err);
            }
        }))
        .catch(log);
};
