'use strict';

const colors = require('colors/safe');

const STATUS_MESSAGES = {
    200: 'OK',
    201: 'Created',
    400: 'Bad request',
    404: 'Not found',
    405: 'Method not supported',
    500: 'Server encountered a problem',
};


//
exports.applyFilters = function(dataSet, filters) {
    // TODO currently, our filters are conjunctions; expand this method to
    // allow matching any or all
    return dataSet.filter(d => {
        let isMatch = true;

        Object.keys(filters).forEach(key => {
            if (d[key] !== filters[key]) {
                isMatch = false;
            }
        });

        return isMatch;
    });
};


//
//
exports.handleErrorResponse = (req, res, err) => {
    let {status, message} = err;
    let requestSummary = exports.summarizeRequest(req);

    // StatusError response; explicit handling within the API
    if (status) {
        message = (message) ? message : STATUS_MESSAGES[status];

        res.status(status).send(message);
        exports.log(`${requestSummary} ... ${status} ${message}`, 'red');

    // non-statused error; script wonk somewhere (500)
    } else {
        res.status(500).send(STATUS_MESSAGES['500']);
        exports.log(err);
    }
};


//
//
exports.handleSuccessResponse = (req, res, data, status=200) => {
    let requestSummary = exports.summarizeRequest(req);
    let responseSummary = status + ' ' + STATUS_MESSAGES[status];

    res.status(status).json(data);
    exports.log(`${requestSummary} ... ${responseSummary}`);
};


//
//
exports.hasValue = (val) => {
    // value is set
    if ((typeof val === 'undefined') || (val === null)) {
        return false;

    // value is not an empty string
    } else if ((typeof val === 'string') && (val.replace(/ /g, '') === '')) {
        return false;

    // value is not NaN
    } else if ((typeof val === 'number') && (isNaN(val))) {
        return false;
    }

    return true;
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
            console.log(`${namespace} ${colors.red.bold('ERROR')}`);
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


//
exports.StatusError = function(status=500, message) {
    this.status = status;
    this.message = message || STATUS_MESSAGES[status];
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


//
exports.validate = (item, peers, validations={}) => {
    let {required, unique} = validations;
    let validation = true;

    if (required) {
        required.forEach(field => {
            if (exports.hasValue(item[field]) === false) {
                validation = `'${field}' is required`;
            }
        });

        // if we've alread failed, bail; the next validation op is more expensive
        if (validation !== true) {
            return validation;
        }
    }

    if (unique) {
        unique.forEach(field => {
            let existingVals = peers.map(p => (p.id !== item.id) ? p[field] : null);

            if (existingVals.indexOf(item[field]) > -1) {
                validation = `${field} '${item[field]}' already exists`;
            }
        });
    }

    return validation;
};
