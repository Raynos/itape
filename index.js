#!/usr/bin/env node

'use strict';

var parseArgs = require('minimist');

var Context = require('./context/');
var failMode = require('./modes/fail.js');
var traceMode = require('./modes/trace.js');
var debugMode = require('./modes/debug.js');

/*Usage

`itape test/index.js` to capture TAP
`itape --fail test/index.js` to run in failure mode.
fix tests
`itape --fail test/index.js` to run in failure mode again.

We write the TAP output of every run to the correct files.

We only write TAP output when we are done.

*/

function main(argv) {
    var context = Context(argv);

    // - if no filename, just bail.
    if (!context.testProgram) {
        return null;
    }

    // - if no last-run-file, run normal
    // - if last-run-file different run normal
    // - if no tap-output run normal
    if (
        !context.lastFilePath ||
        context.lastFilePath !== context.testProgram ||
        !context.lastRunTap
    ) {
        printMode('normal', 'no previous run');
        return context.spawnTest();
    }

    // - if `--trace` then turn on tracing
    if (context.options.trace) {
        printMode('trace', 'trace flag');
        traceMode(context);
    }

    // - if tap-output contains no fails, run normal
    if (context.tapOutput.fail.length === 0) {
        printMode('normal', 'no failing tests');
        return context.spawnTest();
    }

    // - if `--debug` then turn on debug
    if (context.options.debug) {
        printMode('debug', 'debug flag');
        debugMode(context);
    }

    // - if `--fail` or `--trace` or `--debug`
    if (context.options.fail ||
        context.options.trace ||
        context.options.debug
    ) {
        // - else run in fail mode
        printMode('fail', 'failure mode');
        failMode(context);
    } else {
        printMode('normal', 'default mode');
    }

    context.spawnTest();
}

function printMode(mode, reason) {
    console.log('[itape]: ' + mode + ' mode (' + reason + ')');
}

if (require.main === module) {
    main(parseArgs(process.argv.slice(2)));
}
