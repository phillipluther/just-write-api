'use strict';

process.env.NODE_ENV = 'test';
process.env.CONTENT_FOLDER = 'testContent';


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


//
exports.MockRouter = function() {
    this.delete = (handler) => {
        this.delete = handler;
        return this;
    };

    this.get = (handler) => {
        this.get = handler;
        return this;
    };

    this.post = (handler) => {
        this.post = handler;
        return this;
    };

    this.put = (handler) => {
        this.put = handler;
        return this;
    };

    this.route = () => this;
};
