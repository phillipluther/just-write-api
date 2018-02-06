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
        .then(() => log('Content folder built.', 'green'))
        .then(resolve)
        .catch(reject);
});

// builds our PATHS object based on the given content directory
const setPaths = (contentDir) => {
    PATHS.contentDir = path.join(process.cwd(), contentDir);
    PATHS.pageData = path.join(PATHS.contentDir, 'pages.json');
    PATHS.tagData = path.join(PATHS.contentDir, 'tags.json');
};

// hook to ensure the content directory exists; if it doesn't, it's created. called
// every time the API server is fired up
exports.ensure = (contentDir) => {
    setPaths(contentDir);

    return fs.pathExists(PATHS.contentDir)
        .then(exists => (exists) ? true : buildContentFolder())
        .catch(log);
};

// performs same functionality as `ensure`, but synchronously. used by the
// endpoints-only mode of the API
exports.ensureSync = (contentDir) => {
    setPaths(contentDir);

    let contentDirExists = fs.pathExistsSync(PATHS.contentDir);

    if (contentDirExists) {
        return true;
    }

    log('Building content folder', 'green');
    fs.ensureDirSync(PATHS.contentDir);

    log(`Creating: ${contentDir}/pages.json`, 'yellow');
    fs.writeJsonSync(PATHS.pageData, []);

    log(`Creating: ${contentDir}/tags.json`, 'yellow');
    fs.writeJsonSync(PATHS.tagData, []);

    log('Content folder built.\n', 'green')
};
