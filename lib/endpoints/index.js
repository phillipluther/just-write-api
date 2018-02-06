'use strict';


module.exports = (router) => {
    require('./pages')(router);
    require('./pages/tagged')(router);
    require('./page')(router);
    require('./tags')(router);
    require('./tag')(router);

    return router;
};
