'use strict';

const fs = require('fs-extra');
const path = require('path');
const {log} = require('./utils');


const CONTENT_FOLDER = process.env.CONTENT_FOLDER || 'content';

// path exports for our content folder and JSON data files
exports.CONTENT = path.join(process.cwd(), CONTENT_FOLDER);
exports.TAG_DATA = path.join(exports.CONTENT, 'tags.json');
exports.POST_DATA = path.join(exports.CONTENT, 'posts.json');


// helper to create an empty JSON data file at the given path; intended for use
// within createDataFiles() Promise.all wrapper
const createDataFile = (filepath) => new Promise((resolve, reject) => {
    log(`Creating: ${filepath.replace(process.cwd(), '')}`, 'yellow');

    fs.writeJson(filepath, [])
        .then(resolve)
        .catch(reject);
});

// promisified wrapper for creating JSON data files; resolved when all files
// have been created
const createDataFiles = () => new Promise((resolve, reject) => {
    Promise.all([
        createDataFile(exports.POST_DATA),
        createDataFile(exports.TAG_DATA)

    ])
        .then(resolve)
        .catch(reject);
});

// pipeline for building the content folder and required data files
const buildContentFolder = () => new Promise((resolve, reject) => {
    log('Building content folder', 'green');

    fs.ensureDir(exports.CONTENT)
        .then(createDataFiles)
        .then(resolve)
        .catch(reject);
});

// hook to ensure the content directory exists; if it doesn't, it's created. called
// every time the API server is fired up
exports.ensure = () => fs.pathExists(exports.CONTENT)
    .then(exists => (exists) ? true : buildContentFolder())
    .catch(log);
