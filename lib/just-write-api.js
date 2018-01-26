'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const paths = require('./paths');
const {log} = require('./utils');

const DEFAULT_CONF = {
    contentFolder: 'content',
    host: 'localhost',
    port: 8001,
};


// TODO revisit all this; it seems overly complicated


module.exports = (options = {}, onApiStart) => {
    let conf = Object.assign({}, DEFAULT_CONF, options);

    return paths.ensure()
        .then(() => {
            let app = express();
            let router = express.Router();

            app.use(bodyParser.json());
            app.use(bodyParser.urlencoded({
                extended: true
            }));

            // load our endpoints
            require('./routes/tags')(router);
            //require('./routes/posts')(router);
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
