'use strict';


exports.MockRouter = function() {
    //
    this.route = () => this;

    let methods = ['all', 'delete', 'get', 'post', 'put'];
    methods.forEach(method => {
        this[method] = (handler) => {
            this[method] = handler;
            return this;
        };
    });
};


exports.MockRequest = function(options={}) {
    Object.keys(options).forEach(opt => {
        this[opt] = options[opt];
    });
};


exports.MockResponse = function() {
    this.status = (status=200) => {
        this.status = status;
        return this;
    };

    this.json = (data=[]) => {
        this.json = data;
        return this;
    };

    this.send = (body) => {
        this.send = body;
        return this;
    };
};
