'use strict';

const url        = require('url');
const pump       = require('pump');
const request    = require('request');
const JSONStream = require('JSONStream');

// Query and stream raw logs from Logentries. This is not returning an object
// stream. If you want JSON objects, use the `logentriesJsonStream` function.
function logentriesRawStream(pathname, query={}) {
    query = Object.assign({}, query);

    // If query format is not defined, we set it by default to JSON.
    if (!query.format) {
        query.format = 'json';
    }

    // Text format is default in Logentries, in this case we remove the parameter.
    if (query.format === 'text') {
        delete query.format;
    }

    // Put default start and/or end times, if not given.
    if (!query.start && !query.end) {
        query.end   = Date.now();
        query.start = query.end - 15*60*1000; // 15 minutes
    } else if (!query.start) {
        query.start = query.end - 15*60*1000;
    } else if (!query.end) {
        query.end = query.start + 15*60*1000;
    }

    // Return raw stream using the download API.
    return request.get({
        url     : url.format({
            protocol : 'https:',
            host     : 'pull.logentries.com',
            pathname : pathname,
            query    : query
        }),
        gzip    : true,
        timeout : 30000 // 30 seconds
    });
}

// Query and stream logs from Logentries. This returns a readable object stream
// emitting log record JSON objects.
function logentriesJsonStream(pathname, query={}) {
    query = Object.assign({}, query);

    // Force query format to JSON.
    query.format = 'json';

    // Parse each array entry from raw stream and emit JSON objects.
    return pump(logentriesRawStream(pathname, query), JSONStream.parse('*'));
}

// Setup connection to a specific account and log. Returns query function.
function logentriesConnect(options={}) {
    // Define path to access specific account, log set and log.
    let pathname = '/'       + encodeURIComponent(options.account) +
                   '/hosts/' + encodeURIComponent(options.logset) +
                   '/'       + encodeURIComponent(options.log) + '/';

    // Bind path argument in query functions.
    let json = logentriesJsonStream.bind(null, pathname);
    let raw  = logentriesRawStream.bind(null, pathname);

    return Object.assign(json, {
        json : json,
        raw  : raw
    });
}

module.exports = logentriesConnect;
