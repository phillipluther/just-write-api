# Just Write API

A simple API for creating and organizing content via JSON files. No database required, so it works great as a back-end for static site generation.


## Installation

Snag the package from NPM:
```
npm install --save just-write-api
```

### Standalone Usage

The Just Write API can run as a server on Node.js.

Use it programmatically:

```js
const {server} = require('just-write-api');
server([options]);
```

Or start it from the command line:
```
just-write-api [--content-dir content][--host localhost][--port 8001]
```

### Usage as an Express Router

The API endpoints can also be included in an existing Express server. Simply
import `endpointRouter` from the module and use it as you would any other
Express router.

```js
const express = require('express');
const {endpointRouter} = require('just-write-api');

const app = express();

app.use(endpointRouter());

// or, as a nested route
app.use('/api', endpointRouter());

```


## Core Concepts

The Just Write API concerns itself with two things: **pages** and **tags**.

### Pages

Pages could be blog posts, pages on a website, or documents like recipes or book chapters.

A page entity consists of a `title` and `content` property and any optional metadata you'd like to associate with it. They're stored and accessed as JSON.

**Minimally**

```json
{
    "title": "A Minimal Page Example",
    "content": "This is page content."
}
```

**Elaborately**

```json
{
    "title": "A Realistic Example for a Static Site Generator",
    "content": "# My Markdown Content!",
    "tags": "a123, b456",
    "created": "December 27, 2017",
    "updated": "January 3, 2018",
    "author": "Peter Parker"
}
```

### Tags

Tags are organizational units of the Just Write API. They're how pages are classified.

Tag entities consist of a `name` property and any additional metadata; just as with pages, they're stored and accessed as JSON.

**Minimally**

```json
{
    "name": "My Tag"
}
```

**Elaborately**

```json
{
    "name": "A Realistic Tag",
    "description": "A classification relevant to organizing pages.",
    "created": "January 3, 2018",
    "related": "tagId123,tagId456"
}
```

#### No Categories?

No. No categories.

Tags, with other tags, can represent any hierarchy: categories, sub-categories, keywords, etc. Information architecture is unopinionated so you can organize your content however you like using logical dis/conjunctions.


## Endpoints

### `/pages`

| HTTP Method | Required | Returns | Description |
|-------------|----------|---------|-------------|
| GET | | Array of objects | Get a listing of all page entities; supports [filters](#filters) |
| POST | title, content | Object | Create a new tag entity and returns the newly created resource, including its generated UUID and creation timestamp |

### `/pages/tagged/:tagId1[,tagId2,...tagIdN]`

| HTTP Method | Required | Returns | Description |
|-------------|----------|---------|-------------|
| GET | | Array of objects | Retrieve pages tagged by the comma-delimited list of tag IDs. Currently only supports conjunctions of tags, but does support [filters](#filters)

### `/page/:id`

| HTTP Method | Required | Returns | Description |
|-------------|----------|---------|-------------|
| DELETE | | Array of objects | Deletes a specific page resource and returns the new listing of pages |
| GET | | Object | Retrieve data for a specific page resource |
| PUT | title, content | Object | Update a specific page resource and return the updated resource with a timestamp |

### `/tags`

| HTTP Method | Required | Returns | Description |
|-------------|----------|---------|-------------|
| GET | | Array of objects | Get a listing of all tag entities; supports [filters](#filters) |
| POST | name | Object | Create a new tag entity and returns the created resource, including its generated UUID |

### `/tag/:id`

| HTTP Method | Required | Returns | Description |
|-------------|----------|---------|-------------|
| GET | | Object | Retrieve data on a specific tag entity |
| PUT | name | Object | Update a specific tag entity and return the updated tag |
| DELETE | | Array of objects | Delete a specific tag entity and return the updated list of tag entities |


<a name="filters"></a>
## Filters

The API supports filters on specified requests -- namely GETs -- to narrow down a results set. Filters are passed as URI query parameters to the request.

**Example**

```
GET /pages?author=Jack
// returns page entities whose author field matches 'Jack'
```

Currently, filters are only supported for entity field subsets.



## Configuration Options

The API has a minimal set of configuration options. All of them are optional.

| Property | Command Line Flag | Default | Description |
|----------|-------------------|---------|-------------|
| contentDir | --content-dir | content | Folder where content is created and managed in the current working directory |
| host | --host | localhost | Host name where the API server will run. Not available when using `endpointRouter` mode |
| port | --port | 8001 | Port the API server will run on. Not available when using `endpointRouter` mode |
