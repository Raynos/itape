'use strict';

/*global process*/
var $process = process;
var resolve = require('resolve');
var path = require('path');

var env = $process.env;
var testProgram = env.ITAPE_NPM_TEST_PROGRAM;
var baseDir = path.dirname(testProgram);

var leakedHandles = env.ITAPE_NPM_LEAKED_HANDLES;
if (leakedHandles) {
    leakedHandles = JSON.parse(leakedHandles);

    var leakedHandlesFile = resolve.sync('leaked-handles', {
        basedir: baseDir
    });
    var leakedHandlesModule = require(leakedHandlesFile);
    if (typeof leakedHandles === 'object') {
        leakedHandlesModule.set(leakedHandles);
    }
}

var formatStack = env.ITAPE_NPM_FORMAT_STACK;
if (formatStack) {
    formatStack = JSON.parse(formatStack);

    var formatStackFile = resolve.sync('format-stack', {
        basedir: baseDir
    });
    var formatStackModule = require(formatStackFile);
    if (typeof formatStack === 'object') {
        formatStackModule.set(formatStack);
    } else {
        formatStackModule.set({
            traces: 'short'
        });
    }
}

var whiteList = env.ITAPE_NPM_TAPE_WHITELIST;
if (whiteList) {
    whiteList = JSON.parse(whiteList);
    instrumentTape(whiteList);
}

require(testProgram);

function instrumentTape(whiteList) {
    var tapeTestFile = resolve.sync('tape/lib/test', {
        basedir: baseDir
    });
    var tapeTest = require(tapeTestFile);

    var $run = tapeTest.prototype.run;
    tapeTest.prototype.run = function fakeRun() {
        if (whiteList.indexOf(this.name) === -1) {
            this._skip = true;
        }
        $run.apply(this, arguments);
    };
}
