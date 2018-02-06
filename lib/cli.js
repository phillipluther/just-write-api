#! /usr/bin/env node

'use strict';

const apiServer = require('./api-server');
const args = require('minimist')(process.argv.slice(2));


// helper that turns command-line args (hyphenated) into config-friendly
// properties (camelCase); eg. this-that -> thisThat
function toCamelCase(str) {
    let fragments = str.split('-');
    let camelCase = fragments[0];

    for (let i = 1, n = fragments.length; i < n; i++) {
        let fragment = fragments[i];
        let cappedFragment = fragment.charAt(0).toUpperCase() + fragment.substr(1, fragment.length);

        camelCase += cappedFragment;
    }

    return camelCase;
}


// TODO this is ugly; revist this for elegance
let options = {};
Object.keys(args).forEach(arg => {

    options[toCamelCase(arg)] = args[arg];
});

apiServer(options);
