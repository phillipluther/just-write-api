'use strict';

const colors = require('colors/safe');

const GENERIC_STATUS_MESSAGES = {
    200: 'OK',
    201: 'Created',
    400: 'Bad request',
    404: 'Not found',
    405: 'Method not supported',
    500: 'Server encountered a problem',
};


//
exports.ApiError = function(status, message, req={}) {
    this.status = status || 500;
    this.message = message || GENERIC_STATUS_MESSAGES[this.status];
    this.request = exports.summarizeRequest(req);
};


// namespaces and fancifies console.log output for the module. takes a message
// and decorators param; decorators can be a string ('blue', eg.) or an array of
// options from the colors module (['blue', 'bold'])
exports.log = (message, decorators='white') => {
    let namespace = colors.gray('[just-write-api]');
    let colorChain, outputString;
    let useConsoleOut = process.env.NODE_ENV !== 'test';

    // if the given message is an object, we assume it's a thrown error and not
    // an explicit log
    if (typeof message !== 'string') {
        if (useConsoleOut) {
            /* eslint-disable */
            console.log(colors.red.bold('ERROR'));
            console.log(message);
            /* eslint-enable */
        }

        return message.toString();
    }

    if (typeof decorators === 'string') {
        colorChain = colors[decorators];

    // chain the given decorators
    } else {
        colorChain = colors;
        decorators.forEach(decorator => {
            colorChain = colorChain[decorator];
        });
    }

    // TODO any additional logging?

    outputString = namespace + ' ' + colorChain(message);

    if (useConsoleOut) {
        console.log(outputString); // eslint-disable-line
    }

    return outputString;
};


// takes an Express request object and extracts properties into a log-friendly
// string
exports.summarizeRequest = (req={}) => {
    let method = req.method || 'UNKNOWN';
    let path = req.path || '/';
    let query = '';

    let queryKeys = (req.query) ? Object.keys(req.query) : [];

    if (queryKeys.length > 0) {
        let keyVals = queryKeys.map(q => {
            return `${q}=${req.query[q]}`;
        });

        query = `?${keyVals.join('&')}`;
    }

    return `${method} ${path + query}`;
};
