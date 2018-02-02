'use strict';

const fs = require('fs-extra');
const path = require('path');
const {ensure} = require('../../lib/paths');

const contentDir = 'testContent';


exports.testContentRoot = path.join(__dirname, contentDir);
exports.testContentPages = path.join(exports.testContentRoot, 'pages.json');
exports.testContentTags = path.join(exports.testContentRoot, 'tags.json');


exports.createTestContent = () => {
    const testContentRoot = exports.testContentRoot;

    // create our mock content folder
    fs.ensureDirSync(path.join(testContentRoot));

    // mock pages
    fs.writeJsonSync(path.join(testContentRoot, 'pages.json'), [
        { id: 'p1', title: 'Page1', content: 'Page one content' },
        { id: 'p2', title: 'Page2', content: 'Page two content',    tags: 't1,t2',  custom: 'hi' },
        { id: 'p3', title: 'Page3', content: 'Page three content',  tags: 't2',     custom: 'hi' }
    ]);

    // mock tags
    fs.writeJsonSync(path.join(testContentRoot, 'tags.json'), [
        { id: 't1', name: 'Tag1',   slug: 'tag1' },
        { id: 't2', name: 'Tag2',   slug: 'tag2',   filterHook: 'yup' },
        { id: 't3', name: 'Tag3',   slug: 'tag3',   filterHook: 'yup' },
    ]);
};


exports.ensureTestContent = () => {
    return ensure('test/helpers/' + contentDir);
};
