'use strict';

const assert   = require('assert');
const endpoint = require('endpoint');
const mitm     = require('mitm')();
const le       = require('.')({
    account : '12345678-1234-1234-1234-123456789012',
    logset  : 'my_logs',
    log     : 'my_log'
});

// Stub out all http requests made with a mock response.
mitm.on('request', function(request, response) {
    assert.equal(request.headers.host, 'pull.logentries.com');
    assert.equal(request.url, '/12345678-1234-1234-1234-123456789012/hosts/my_logs/my_log/?filter=%2Finfo%2Fi&start=1498300000000&end=1498300600000&format=json');
    response.end('[\n{"m":"Record 1"},\n{"m":"Record 2"}\n]');
});

// Test 1: `le(query)` returns readable object stream emitting log records.
le({
    filter : '/info/i',
    start  : 1498300000000,
    end    : 1498300600000
}).pipe(endpoint({ objectMode : true }, (error, array) => {
    if (error) { throw error; }
    assert.deepEqual(array, [ { m: 'Record 1' }, { m: 'Record 2' } ]);
}));

// Test 2: `le.raw(query)` returns readable stream emitting raw data.
le.raw({
    filter : '/info/i',
    start  : 1498300000000,
    end    : 1498300600000
}).pipe(endpoint((error, result) => {
    if (error) { throw error; }
    assert.equal(result.toString(), '[\n{"m":"Record 1"},\n{"m":"Record 2"}\n]');
}));
