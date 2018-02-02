'use strict';

const fs = require('fs-extra');
const path = require('path');
const {log} = require('./utils');


const PATHS = {
    contentDir: '',
    pageData: '',
    tagData: '',
};

exports.getContentPath = () => PATHS.contentDir;
exports.getTagDataPath = () => PATHS.tagData;
exports.getPageDataPath = () => PATHS.pageData;

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
        createDataFile(PATHS.pageData),
        createDataFile(PATHS.tagData)
    ])
        .then(resolve)
        .catch(reject);
});

// pipeline for building the content folder and required data files
const buildContentFolder = () => new Promise((resolve, reject) => {
    log('Building content folder', 'green');

    fs.ensureDir(PATHS.contentDir)
        .then(createDataFiles)
        .then(resolve)
        .catch(reject);
});

// hook to ensure the content directory exists; if it doesn't, it's created. called
// every time the API server is fired up
exports.ensure = (contentDir) => {
    PATHS.contentDir = path.join(process.cwd(), contentDir);
    PATHS.pageData = path.join(PATHS.contentDir, 'pages.json');
    PATHS.tagData = path.join(PATHS.contentDir, 'tags.json');

    return fs.pathExists(PATHS.contentDir)
        .then(exists => (exists) ? true : buildContentFolder())
        .catch(log);
};
