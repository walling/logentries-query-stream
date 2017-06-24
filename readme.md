> Node module to stream logs from Logentries

![logentries-query-stream](https://api.travis-ci.org/walling/logentries-query-stream.svg)

This module enables you to query log records in Logentries emitted as a stream. Example:

```js
var le = require('logentries-query-stream')({
    account : '00000000-0000-0000-0000-000000000000',
    logset  : 'my_logs',
    log     : 'my_log'
});

le({ filter : '/info/i' })
    .on('data', log => {
        // Output log record message.
        console.log(log.m);
    });
```


### Content

- [Install](#install)
- [Command line tool](#command-line-tool)
- [API](#api)
  - [le(query) -> Readable Object Stream](#lequery---readable-object-stream)
  - [le.raw(query) -> Readable Stream](#lerawquery---readable-stream)
- [Read More](#read-more)
- [License](#license)


### Install

```bash
npm install --save logentries-query-stream
```


### Command line tool

If you want to search and stream the logs using a command line tool, please [check out `logentries-query-cli` module](https://www.npmjs.com/package/logentries-query-cli).


### API

Before querying you need to connect to a specific log. Example:

```js
var le = require('logentries-query-stream')({
    account : '00000000-0000-0000-0000-000000000000',
    logset  : 'my_logs',
    log     : 'my_log'
});
```

Options:

- **account:** (UUID) - Account key used for authentication with Logentries
- **logset:** (UUID|string) - ID or name of the log set to query
- **log:** (UUID|string) - ID or name of the log to query


#### le(query) -> Readable Object Stream

Alias: `le.json(query)`

Makes a query and returns a stream emitting log records as JSON objects. Example:

```js
le({
    start  : Date.now() - 20*60*1000,
    end    : Date.now(),
    limit  : 100
})
    .on('data', log => console.log(log.m));
```

Query:

- **start:** (Unix time in milliseconds) - Defines time range to search
- **end:** (Unix time in milliseconds) - Defines time range to search
- **filter:** (String) - Logentries formatted search query
- **limit:** (Integer) - Limit number of returned log records

Format of emitted log records:

- **r:** (UUID) - ID of the log
- **s:** Not documented
- **t:** (Unix time in milliseconds) - When the record was received
- **m:** (String) - Text message of the record


#### le.raw(query) -> Readable Stream

Makes a query and returns a stream emitting log records as raw JSON or text. Example:

```js
le.raw({
    format : 'text',
    start  : Date.now() - 20*60*1000,
    end    : Date.now(),
    limit  : 100
}).pipe(fs.createWriteStream('example.log'));
```

The query have the same options as the [`le(query)`](#lequery---readable-object-stream) with the addition of one extra property:

- **format:** (String) - Either 'json' (default) or 'text' for line-based format


### Read More

You can read more about [the workings of the Logentries API here](https://docs.logentries.com/v1.0/docs/api-download).


### License

Code is licensed under MIT, please see [license.md file](license.md) for details.
