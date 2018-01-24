'use strict';

process.env.NODE_ENV = 'test';
process.env.CONTENT_FOLDER = 'testContent';


//const fs = require('fs-extra');
//const paths = require('../lib/paths');


//
exports.createTestContent = () => {
    //fs.ensureDirSync
};


//
exports.MockRequest = function(method='GET', path='mock/request', query={}) {
    this.method = method;
    this.path = path;
    this.query = query;
};


//
exports.MockResponse = function() {
    this.json = (obj) => {
        this.json = obj;
        return this;
    };

    this.send = (message) => {
        this.send = message;
        return this;
    };

    this.status = (status) => {
        this.status = status;
        return this;
    };
};
